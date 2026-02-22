// DentaVoice API Proxy — Template-based structuring + OCR + AI Agent
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

// ===== 11 TEMPLATE DEFINITIONS =====
// Each template: sections → fields. Field format "key:Label".
// Shared field strings avoid repetition.

const F = {
  HEALTH_FULL: "medhx:Medhx|conditions:Conditions|allergies:Allergies|rx:Rx|surgeries:Surgeries/Hospitalizations|social_history:Social history",
  DENTAL_HISTORY: "ldv:LDV|dental_home:Dental home|trauma:Trauma|habits:Habits|brushing:Brushing|diet:Diet",
  NPE_TX: "eoe:EOE|ioe:IOE|soft_tissue:Soft tissue|occlusion:Occlusion|hard_tissue:Hard tissue|oh:OH|rads:Rads|rad_findings:Rad findings|other_treatment:Other treatment",
  RESTORATIVE: "extraction:Extraction|ssc:SSC|sscp:SSCP (Pulpotomy)|composite_resin:Composite resin|sealant:Sealant",
  PRES_FULL: "type:Presentation type|presenting_with:Presents with|preop_discussion:Pre-op discussion|consent:Consent|chief_complaint:Chief complaint|history:History",
  PRES_SHORT: "type:Presentation type|presenting_with:Presents with|preop_discussion:Pre-op discussion|chief_complaint:Chief complaint|history:History",
};

const TEMPLATES = {
  npe_no_caries: {
    name: "NPE – No Caries / No Treatment",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|modalities:Discussed modalities of treatment|recommended_modality:Recommended modality|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  npe_no_caries_simple: {
    name: "NPE – No Caries (Simplified)",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  npe_caries_ga: {
    name: "NPE – Caries / Recommended GA",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|treatment_spectrum:Treatment spectrum discussed|modalities:Discussed modalities|recommended_modality:Recommended (GA)|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  npe_caries_n2o: {
    name: "NPE – Caries / Recommended N2O",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|treatment_spectrum:Treatment spectrum discussed|modalities:Discussed modalities|recommended_modality:Recommended (N2O)|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  npe_caries_po: {
    name: "NPE – Caries / Recommended PO Sedation",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|treatment_spectrum:Treatment spectrum discussed|modalities:Discussed modalities|recommended_modality:Recommended (PO/N2O)|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  ga_rehab: {
    name: "GA Oral Rehabilitation",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: "type:Presentation type|presenting_with:Presents with|preop_discussion:Pre-op discussion|parent_awareness:Parent awareness of changes" },
      { key:"operative_team", title:"OPERATIVE TEAM", fields: "surgeon:Surgeon/Dentist|assistant:Dental Assistant|anesthesiologist:Anesthesiologist|nurse:Medical Nurse" },
      { key:"reasons", title:"REASONS FOR PROCEDURE", fields: "reasons:Reasons for procedure" },
      { key:"health", title:"HEALTH", fields: "medhx:Medhx|medical_history:Medical history" },
      { key:"treatment", title:"TREATMENT", fields: "ga_narrative:GA procedure narrative|isolation:Isolation|clinical_exam:Clinical examination|rad_exam:Radiographic examination|rad_findings:Radiographic findings|"+F.RESTORATIVE+"|prophy_fluoride:Prophy & Topical F-|margins_occlusion:Margins + Occlusion|extubation:Extubation & Recovery|dismissal:Dismissal" },
      { key:"evaluation", title:"EVALUATION", fields: "postop_discussion:Post-op discussion with parents|recovery_instructions:Recovery instructions|expectations:Expectations & pain management|recall:Recall recommendation" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  po_sedation: {
    name: "Oral Sedation (PO/Midazolam) Restorative",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_SHORT },
      { key:"health", title:"HEALTH", fields: "medhx:Medhx|preop_workup:Pre-operative workup|preop_vitals:Pre-operative vitals|patient_weight:Patient weight" },
      { key:"sedation_record", title:"SEDATION RECORD", fields: "time_provided:Time sedation provided|sedation_mg:Sedation (mg)|sedation_ml:Sedation (ml)|vitals_admin:Vitals at administration|vitals_15:Vitals 15 min|vitals_30:Vitals 30 min|vitals_45:Vitals 45 min|vitals_60:Vitals 60 min|vitals_75:Vitals 75 min|postop_vitals_time:Post-op vitals time|max_sedation:Max sedation level|vitals_postop:Vitals post-op|discharge_status:Discharge status" },
      { key:"treatment", title:"TREATMENT", fields: "anesthesia:Anesthesia|isolation:Isolation|"+F.RESTORATIVE+"|margins_occlusion:Margins + Occlusion" },
      { key:"evaluation", title:"EVALUATION", fields: "behaviour:Behaviour|poi_discussion:POI & discussion" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  recall: {
    name: "Recall Exam",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_FULL },
      { key:"health", title:"HEALTH", fields: F.HEALTH_FULL },
      { key:"dental_history", title:"DENTAL HISTORY", fields: F.DENTAL_HISTORY },
      { key:"treatment", title:"TREATMENT", fields: F.NPE_TX },
      { key:"evaluation", title:"EVALUATION", fields: "diagnoses:Diagnoses|behaviour:Behaviour|discussion:Discussion & OHI|treatment_spectrum:Treatment spectrum discussed|modalities:Discussed modalities|recommended_modality:Recommended modality|parent_consent:Parent agreement" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  restorative: {
    name: "Restorative (Standard / No Sedation)",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_SHORT },
      { key:"health", title:"HEALTH", fields: "medhx:Medhx" },
      { key:"treatment", title:"TREATMENT", fields: "anesthesia:Anesthesia|isolation:Isolation|"+F.RESTORATIVE+"|margins_occlusion:Margins + Occlusion" },
      { key:"evaluation", title:"EVALUATION", fields: "behaviour:Behaviour|poi_discussion:POI & discussion" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  restorative_n2o: {
    name: "Restorative with N2O",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: F.PRES_SHORT },
      { key:"health", title:"HEALTH", fields: "medhx:Medhx|preop_workup:Pre-operative workup" },
      { key:"treatment", title:"TREATMENT", fields: "n2o_preop_vitals:N2O pre-op vitals|n2o_titration:N2O titration|n2o_start:Time N2O started|n2o_postop_vitals:N2O post-op vitals|n2o_end:Time N2O finished|discharge_status:Discharge status|anesthesia:Anesthesia|isolation:Isolation|"+F.RESTORATIVE+"|margins_occlusion:Margins + Occlusion" },
      { key:"evaluation", title:"EVALUATION", fields: "behaviour:Behaviour|poi_discussion:POI & discussion" },
      { key:"plan", title:"PLAN", fields: "plan:Plan" },
    ],
  },
  combined_n2o_po: {
    name: "Combined N2O + Oral Sedation (Midazolam)",
    sections: [
      { key:"presentation", title:"PRESENTATION", fields: "presenting_with:Presents with|medical_review:Medical history reviewed|treatment_plan_review:Treatment plan reviewed|cooperation_note:Cooperation/GA note|npo_status:NPO status|consent:Informed consent" },
      { key:"sedation_assessment", title:"SEDATION ASSESSMENT", fields: "mallampati:Mallampati|brodsky:Brodsky|asa:ASA|sedation_hx:Sedation history|weight:Weight|midazolam_dose:Midazolam dose & calculation|time_given:Given PO at" },
      { key:"preop_vitals", title:"PRE-OPERATIVE VITALS", fields: "bp:BP|hr:HR|spo2:SpO2|rr:RR|tx_started:Tx started at|monitoring:Monitoring" },
      { key:"n2o_sedation", title:"N2O SEDATION", fields: "n2o_consent:Consent|n2o_protocol:Protocol|n2o_percentage:N2O % maintained|titration_back:Titration back to O2|staff_present:Staff present|units:Units administered" },
      { key:"treatment", title:"TREATMENT", fields: "anesthesia:Anesthesia|isolation:Isolation|composite:Composite (tooth #)|ssc:SSC (tooth #)|extraction:Extraction" },
      { key:"postoperative", title:"POST-OPERATIVE", fields: "intended_sedation:Intended sedation level|achieved_sedation:Achieved sedation level|postop_vitals:Post-op vitals|tx_ended:Tx ended at|fit_discharge:Fit for discharge at|poi_given:POI given|discharge_status:Discharge status|left_facility:Left facility at|postop_instructions:Post-op instructions|child_cooperation:Cooperation (Frankl)" },
      { key:"plan", title:"PLAN", fields: "next_visit:Next visit" },
    ],
  },
};

// Build a template-specific prompt for the AI
function buildTemplatePrompt(templateId) {
  const tmpl = TEMPLATES[templateId];
  if (!tmpl) return null;

  let fieldSpec = "";
  tmpl.sections.forEach((sec) => {
    fieldSpec += `\n### ${sec.title}\n`;
    sec.fields.split("|").forEach((f) => {
      const [key, label] = f.split(":");
      fieldSpec += `- "${sec.key}.${key}": ${label}\n`;
    });
  });

  return `You are a pediatric dental clinical documentation assistant. Structure the dictated notes into the "${tmpl.name}" template.

Return ONLY a JSON object with two keys:

"notes": a nested object. Top-level keys are section keys, each containing field key-value pairs. Use the EXACT keys below. If a field was not mentioned, use "[blank]". Keep values concise using dental shorthand (WNL, bid, OHI, etc.).
${fieldSpec}
"recommendations": array of 2-4 objects: {category:"clinical|followup|medication|preventive|diagnostic|safety", title:"5-8 words", detail:"1-2 sentences", priority:"high|medium|low"}

Rules:
- FDI tooth numbering. Proper pediatric dental terminology.
- Fill template defaults when dictation implies normal/negative (e.g. "See below", "WNL", "None", "No change").
- For fields the dentist mentioned, capture exact clinical details.
- Return ONLY valid JSON, no markdown fences.`;
}

// Fallback SOAP prompt (backward compatibility for notes without template)
const STRUCTURE_PROMPT = `You are a dental clinical documentation assistant. Given raw dictated notes, return ONLY a JSON object with two keys:

"notes": object with applicable SOAP fields from this list (omit empty ones):
subjective_chief_complaint, subjective_hpi, subjective_medical_history, subjective_allergies, objective_extraoral, objective_intraoral, objective_teeth_findings, objective_radiographic, assessment_diagnosis, assessment_differential, assessment_cdt_codes, plan_treatment_performed, plan_materials_used, plan_anesthesia, plan_post_op, plan_follow_up, plan_referrals, additional_notes

"recommendations": array of 3-6 objects, each: {category: "clinical|followup|medication|preventive|diagnostic|safety", title: "5-8 words", detail: "1-2 sentences", priority: "high|medium|low"}

Rules: FDI tooth numbering. Proper dental terminology. Concise. Suggest CDT codes when identifiable. Recommendations should be genuinely useful. Return ONLY valid JSON.`;

// OCR prompt
const OCR_PROMPT = `Extract ALL text from this dental clinical document image. Preserve structure and meaning.

Return ONLY a JSON object: {"extracted_text":"...","patient_name":"name or null","patient_id":"id or null"}

Rules: Read handwritten text carefully using dental context. Preserve tooth numbers exactly (FDI/Universal). Preserve medication names and dosages exactly. Use [illegible] for unreadable text. Maintain paragraph breaks. Include checkboxes, circled items, annotations. For forms, identify field labels and values. Look for patient name in fields like "Patient","Name". Look for ID in fields like "Chart #","Patient ID","MRN","File #". Return ONLY valid JSON.`;

// AI Agent knowledge prompt (cacheable)
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
    const mode = body.mode || "structure";

    // ===== MODE: OCR =====
    if (mode === "ocr") {
      const imageData = body.image;
      const mediaType = body.media_type || "image/jpeg";

      if (!imageData) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "No image provided." }) };
      }
      if (imageData.length > 14000000) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Image too large (max 10MB)." }) };
      }

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 3000,
          system: [{ type: "text", text: OCR_PROMPT, cache_control: { type: "ephemeral" } }],
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: imageData } },
              { type: "text", text: "Extract all text from this dental clinical document. Preserve all details accurately." },
            ],
          }],
        }),
      });

      const data = await response.json();
      if (data.error) {
        return { statusCode: response.status, headers: CORS_HEADERS, body: JSON.stringify({ error: data.error.message || "AI service error" }) };
      }

      const extractedRaw = data.content[0].text.replace(/```json|```/g, "").trim();
      let ocrResult;
      try { ocrResult = JSON.parse(extractedRaw); } catch (e) { ocrResult = { extracted_text: extractedRaw, patient_name: null, patient_id: null }; }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          extracted_text: ocrResult.extracted_text || extractedRaw,
          patient_name: ocrResult.patient_name || null,
          patient_id: ocrResult.patient_id || null,
          usage: { input_tokens: data.usage?.input_tokens || 0, output_tokens: data.usage?.output_tokens || 0, cache_read: data.usage?.cache_read_input_tokens || 0, cache_creation: data.usage?.cache_creation_input_tokens || 0 },
        }),
      };
    }

    // ===== MODE: AGENT =====
    if (mode === "agent") {
      const messages = body.messages;
      const patientContext = body.patient_context || "";
      const needsPatientData = body.needs_patient_data !== false;
      const conversationSummary = body.conversation_summary || "";

      if (!messages || !messages.length) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "No messages provided." }) };
      }

      const systemBlocks = [{ type: "text", text: AGENT_KNOWLEDGE_PROMPT, cache_control: { type: "ephemeral" } }];

      if (needsPatientData && patientContext) {
        systemBlocks.push({
          type: "text",
          text: "## PATIENT RECORDS\nBelow is a compact index of the dentist's patient records.\n\n" + patientContext,
          cache_control: { type: "ephemeral" },
        });
      }

      const efficientMessages = [];
      if (conversationSummary) {
        efficientMessages.push({ role: "user", content: "[Previous conversation summary: " + conversationSummary + "]" });
        efficientMessages.push({ role: "assistant", content: "Understood, I have the context from our earlier discussion. How can I help?" });
      }
      efficientMessages.push(...messages.slice(-8));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: needsPatientData ? 2000 : 1500,
          system: systemBlocks,
          messages: efficientMessages,
        }),
      });

      const data = await response.json();
      if (data.error) {
        return { statusCode: response.status, headers: CORS_HEADERS, body: JSON.stringify({ error: data.error.message || "AI service error" }) };
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          reply: data.content[0].text,
          usage: { input_tokens: data.usage?.input_tokens || 0, output_tokens: data.usage?.output_tokens || 0, cache_read: data.usage?.cache_read_input_tokens || 0, cache_creation: data.usage?.cache_creation_input_tokens || 0 },
        }),
      };
    }

    // ===== MODE: STRUCTURE (with optional template) =====
    const transcript = body.transcript;
    const templateId = body.template_id || null;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 10) {
      return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Please provide a longer dictation (at least a few words)." }) };
    }

    const trimmed = transcript.trim().slice(0, 15000);

    // Choose prompt: template-specific or generic SOAP
    let systemPrompt;
    let templateMeta = null;

    if (templateId && TEMPLATES[templateId]) {
      systemPrompt = buildTemplatePrompt(templateId);
      const tmpl = TEMPLATES[templateId];
      templateMeta = {
        id: templateId,
        name: tmpl.name,
        sections: tmpl.sections.map((s) => ({
          key: s.key,
          title: s.title,
          fields: s.fields.split("|").map((f) => { const [k, l] = f.split(":"); return { key: k, label: l }; }),
        })),
      };
    } else {
      systemPrompt = STRUCTURE_PROMPT;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2500,
        system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content: 'Dictated dental notes:\n\n"' + trimmed + '"' }],
      }),
    });

    const data = await response.json();
    if (data.error) {
      return { statusCode: response.status, headers: CORS_HEADERS, body: JSON.stringify({ error: data.error.message || "AI service error" }) };
    }

    const rawText = data.content[0].text.replace(/```json|```/g, "").trim();
    let parsed;
    try { parsed = JSON.parse(rawText); } catch (e) {
      return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "AI returned invalid format. Please try again." }) };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        notes: parsed.notes || {},
        recommendations: parsed.recommendations || [],
        template_meta: templateMeta,
        usage: { input_tokens: data.usage?.input_tokens || 0, output_tokens: data.usage?.output_tokens || 0, cache_read: data.usage?.cache_read_input_tokens || 0, cache_creation: data.usage?.cache_creation_input_tokens || 0 },
      }),
    };
  } catch (error) {
    return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Server error: " + error.message }) };
  }
};
