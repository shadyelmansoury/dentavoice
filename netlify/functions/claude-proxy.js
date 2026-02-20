// DentaVoice API Proxy — Optimized for cost & performance
// Runs on Netlify's servers, keeps API key secure

// Simple in-memory rate limiter (resets on cold start, ~10min window on Netlify)
const requestCounts = {};
const RATE_LIMIT = 30; // max requests per IP per window
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts[ip] || now - requestCounts[ip].start > RATE_WINDOW_MS) {
    requestCounts[ip] = { count: 1, start: now };
    return true;
  }
  requestCounts[ip].count++;
  return requestCounts[ip].count <= RATE_LIMIT;
}

// Single optimized prompt that produces BOTH structured notes AND recommendations
// in one API call instead of two (cuts cost and latency in half)
const SYSTEM_PROMPT = `You are a dental clinical documentation assistant. Given raw dictated notes, produce two things:

1. A SOAP-format clinical note as JSON
2. 3-6 clinical recommendations

Respond with ONLY a JSON object in this exact format:
{
  "notes": {
    "subjective_chief_complaint": "",
    "subjective_hpi": "",
    "subjective_medical_history": "",
    "subjective_allergies": "",
    "objective_extraoral": "",
    "objective_intraoral": "",
    "objective_teeth_findings": "",
    "objective_radiographic": "",
    "assessment_diagnosis": "",
    "assessment_differential": "",
    "assessment_cdt_codes": "",
    "plan_treatment_performed": "",
    "plan_materials_used": "",
    "plan_anesthesia": "",
    "plan_post_op": "",
    "plan_follow_up": "",
    "plan_referrals": "",
    "additional_notes": ""
  },
  "recommendations": [
    {
      "category": "clinical|followup|medication|preventive|diagnostic|safety",
      "title": "Short title (5-8 words)",
      "detail": "1-2 sentence explanation",
      "priority": "high|medium|low"
    }
  ]
}

Rules:
- Include ONLY sections that have relevant info from the dictation. Omit empty sections.
- Use FDI tooth numbering. Use proper dental terminology. Be concise.
- Suggest relevant CDT codes when identifiable from treatment described.
- Recommendations should be genuinely useful clinical insights.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

exports.handler = async function (event) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Rate limiting
  const clientIP =
    event.headers["x-forwarded-for"] ||
    event.headers["client-ip"] ||
    "unknown";
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Too many requests. Please wait a few minutes.",
      }),
    };
  }

  // API key check
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          "API key not configured. Add ANTHROPIC_API_KEY in Netlify environment variables.",
      }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const transcript = body.transcript;

    // Validate input
    if (
      !transcript ||
      typeof transcript !== "string" ||
      transcript.trim().length < 10
    ) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Please provide a longer dictation (at least a few words).",
        }),
      };
    }

    // Truncate extremely long transcripts to control costs (max ~3000 words)
    const trimmed = transcript.trim().slice(0, 15000);

    // Single optimized API call with prompt caching
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        // Haiku 4.5: fast, cheap, excellent at structured extraction
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            // Prompt caching: system prompt is cached across calls
            // First call: normal price. Subsequent calls: 90% cheaper for this portion
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content:
              'Dictated dental notes:\n\n"' + trimmed + '"',
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: data.error.message || "AI service error",
        }),
      };
    }

    // Parse and validate the AI response
    const rawText = data.content[0].text
      .replace(/```json|```/g, "")
      .trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "AI returned invalid format. Please try again.",
        }),
      };
    }

    // Return structured result with usage stats for monitoring
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store", // Never cache patient data
      },
      body: JSON.stringify({
        notes: parsed.notes || {},
        recommendations: parsed.recommendations || [],
        usage: {
          input_tokens: data.usage?.input_tokens || 0,
          output_tokens: data.usage?.output_tokens || 0,
          cache_read: data.usage?.cache_read_input_tokens || 0,
          cache_creation: data.usage?.cache_creation_input_tokens || 0,
        },
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error: " + error.message }),
    };
  }
};
