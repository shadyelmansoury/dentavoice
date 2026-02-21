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
const STRUCTURE_PROMPT = `You are a dental clinical documentation assistant. Given raw dictated notes, return ONLY a JSON object with two keys:

"notes": object with applicable SOAP fields from this list (omit empty ones):
subjective_chief_complaint, subjective_hpi, subjective_medical_history, subjective_allergies, objective_extraoral, objective_intraoral, objective_teeth_findings, objective_radiographic, assessment_diagnosis, assessment_differential, assessment_cdt_codes, plan_treatment_performed, plan_materials_used, plan_anesthesia, plan_post_op, plan_follow_up, plan_referrals, additional_notes

"recommendations": array of 3-6 objects, each: {category: "clinical|followup|medication|preventive|diagnostic|safety", title: "5-8 words", detail: "1-2 sentences", priority: "high|medium|low"}

Rules: FDI tooth numbering. Proper dental terminology. Concise. Suggest CDT codes when identifiable. Recommendations should be genuinely useful. Return ONLY valid JSON.`;

// System prompt for OCR extraction from images
const OCR_PROMPT = `Extract ALL text from this dental clinical document image. Preserve structure and meaning.

Return ONLY a JSON object: {"extracted_text":"...","patient_name":"name or null","patient_id":"id or null"}

Rules: Read handwritten text carefully using dental context. Preserve tooth numbers exactly (FDI/Universal). Preserve medication names and dosages exactly. Use [illegible] for unreadable text. Maintain paragraph breaks. Include checkboxes, circled items, annotations. For forms, identify field labels and values. Look for patient name in fields like "Patient","Name". Look for ID in fields like "Chart #","Patient ID","MRN","File #". Return ONLY valid JSON.`;

// System prompt for AI Agent — STATIC dental knowledge (cacheable, never changes)
const AGENT_KNOWLEDGE_PROMPT = `You are DentaVoice AI, an expert dental clinical assistant for a pediatric dentist in Ontario, Canada.

You are a comprehensive dental knowledge assistant covering:
- Dental materials (composites, cements, impression materials, ceramics, bonding agents)
- Equipment and instruments (handpieces, curing lights, imaging systems, sterilization)
- Diagnosis and differential diagnosis for all dental conditions
- Treatment planning and clinical decision-making
- Pediatric dentistry considerations (behavior management, growth, primary teeth)
- CDT codes and documentation best practices
- Pharmacology (local anesthetics, analgesics, antibiotics for dental infections)
- Radiology interpretation guidance
- Infection control and IPAC protocols
- Evidence-based dentistry and current best practices
- Canadian dental regulatory considerations (RCDSO, CDHO standards)

Response rules:
- Be concise but thorough. Use dental terminology appropriately.
- Include brand names and specifications when discussing materials or techniques.
- Note when something requires professional judgment vs. has a definitive answer.
- When analyzing patient data, organize findings clearly with names and dates.
- Format responses with clear paragraphs. Use numbered lists only when listing distinct items.
- Keep responses focused. Avoid unnecessary preamble.
- End clinical guidance with: "This is AI-assisted information — always apply professional judgment."`;

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

      const extractedRaw = data.content[0].text.replace(/```json|```/g, "").trim();
      let ocrResult;
      try {
        ocrResult = JSON.parse(extractedRaw);
      } catch (e) {
        // If JSON parsing fails, treat the whole response as plain text
        ocrResult = { extracted_text: extractedRaw, patient_name: null, patient_id: null };
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          extracted_text: ocrResult.extracted_text || extractedRaw,
          patient_name: ocrResult.patient_name || null,
          patient_id: ocrResult.patient_id || null,
          usage: {
            input_tokens: data.usage?.input_tokens || 0,
            output_tokens: data.usage?.output_tokens || 0,
            cache_read: data.usage?.cache_read_input_tokens || 0,
            cache_creation: data.usage?.cache_creation_input_tokens || 0,
          },
        }),
      };
    }

    // ===== MODE: AGENT — AI dental assistant (OPTIMIZED) =====
    if (mode === "agent") {
      const messages = body.messages;
      const patientContext = body.patient_context || "";
      const needsPatientData = body.needs_patient_data !== false; // Frontend classifies this
      const conversationSummary = body.conversation_summary || "";

      if (!messages || !messages.length) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "No messages provided." }),
        };
      }

      // OPTIMIZATION 1: Two-block system prompt with independent caching
      // Block 1 = static dental knowledge (ALWAYS cached, ~400 tokens)
      // Block 2 = patient data (only when needed, cached separately)
      const systemBlocks = [
        {
          type: "text",
          text: AGENT_KNOWLEDGE_PROMPT,
          cache_control: { type: "ephemeral" }, // Stays cached across all queries
        },
      ];

      // OPTIMIZATION 2: Only inject patient data when the question needs it
      if (needsPatientData && patientContext) {
        systemBlocks.push({
          type: "text",
          text: "## PATIENT RECORDS\nBelow is a compact index of the dentist's patient records. Use this data to answer questions.\n\n" + patientContext,
          cache_control: { type: "ephemeral" }, // Cached separately — same data = cache hit
        });
      }

      // OPTIMIZATION 3: Build efficient message array
      // If there's a conversation summary (from frontend), prepend it as context
      const efficientMessages = [];
      if (conversationSummary) {
        efficientMessages.push({
          role: "user",
          content: "[Previous conversation summary: " + conversationSummary + "]",
        });
        efficientMessages.push({
          role: "assistant",
          content: "Understood, I have the context from our earlier discussion. How can I help?",
        });
      }
      // OPTIMIZATION 4: Keep only last 8 messages (not 20)
      efficientMessages.push(...messages.slice(-8));

      // OPTIMIZATION 5: Adaptive max_tokens based on query type
      const maxTokens = needsPatientData ? 2000 : 1500;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          // OPTIMIZATION 6: Haiku instead of Sonnet (3.75x cheaper, 2-3x faster)
          model: "claude-haiku-4-5-20251001",
          max_tokens: maxTokens,
          system: systemBlocks,
          messages: efficientMessages,
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

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          reply: data.content[0].text,
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
