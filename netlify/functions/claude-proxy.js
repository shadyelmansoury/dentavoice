// DentaVoice API Proxy — Handles text structuring + image OCR
// Runs on Netlify's servers, keeps API key secure

const requestCounts = {};
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!requestCounts[ip] || now - requestCounts[ip].start > RATE_WINDOW_MS) {
    requestCounts[ip] = { count: 1, start: now };
    return true;
  }
  requestCounts[ip].count++;
  return requestCounts[ip].count <= RATE_LIMIT;
}

// System prompt for structuring notes into SOAP format
const STRUCTURE_PROMPT = `You are a dental clinical documentation assistant. Given raw dictated notes, produce two things:

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

// System prompt for OCR extraction from images
const OCR_PROMPT = `You are an expert at reading and extracting text from dental clinical documents, including handwritten notes, printed forms, lab reports, referral letters, and patient intake forms.

Extract ALL text from the provided image as accurately as possible. Preserve the structure and meaning of the original document.

Rules:
- Read handwritten text carefully, using dental context to resolve ambiguous letters
- Preserve tooth numbers exactly as written (FDI or Universal notation)
- Preserve medication names, dosages, and material specifications exactly
- If text is partially illegible, use [illegible] as a placeholder
- Maintain paragraph breaks and logical groupings from the original
- Include any checkboxes, circled items, or annotations
- If the image contains a standard form, identify the field labels and their values
- Return ONLY the extracted text, nothing else — no commentary or explanation`;

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "no-store",
};

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

  const clientIP = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown";
  if (!checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Too many requests. Please wait a few minutes." }),
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "API key not configured. Add ANTHROPIC_API_KEY in Netlify environment variables." }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const mode = body.mode || "structure"; // "structure" or "ocr"

    // ===== MODE: OCR — Extract text from image =====
    if (mode === "ocr") {
      const imageData = body.image; // base64 string
      const mediaType = body.media_type || "image/jpeg"; // image/jpeg, image/png, image/webp

      if (!imageData) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "No image provided." }),
        };
      }

      // Validate image size (base64 string length — rough check for ~10MB limit)
      if (imageData.length > 14000000) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Image is too large. Please use a smaller image (under 10MB)." }),
        };
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3000,
          system: [
            {
              type: "text",
              text: OCR_PROMPT,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType,
                    data: imageData,
                  },
                },
                {
                  type: "text",
                  text: "Extract all text from this dental clinical document. Preserve all details accurately.",
                },
              ],
            },
          ],
        }),
      });

      const data = await response.json();

      if (data.error) {
        return {
          statusCode: response.status,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: data.error.message || "AI service error" }),
        };
      }

      const extractedText = data.content[0].text;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          extracted_text: extractedText,
          usage: {
            input_tokens: data.usage?.input_tokens || 0,
            output_tokens: data.usage?.output_tokens || 0,
            cache_read: data.usage?.cache_read_input_tokens || 0,
            cache_creation: data.usage?.cache_creation_input_tokens || 0,
          },
        }),
      };
    }

    // ===== MODE: STRUCTURE — Convert text to SOAP notes =====
    const transcript = body.transcript;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Please provide a longer dictation (at least a few words)." }),
      };
    }

    const trimmed = transcript.trim().slice(0, 15000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        system: [
          {
            type: "text",
            text: STRUCTURE_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: 'Dictated dental notes:\n\n"' + trimmed + '"',
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: response.status,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: data.error.message || "AI service error" }),
      };
    }

    const rawText = data.content[0].text.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (parseErr) {
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "AI returned invalid format. Please try again." }),
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
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
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Server error: " + error.message }),
    };
  }
};
