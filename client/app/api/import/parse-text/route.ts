import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { withApiErrorHandling } from '@/lib/api-handler';
import { createClient } from '@/lib/supabase/server';

export const POST = withApiErrorHandling(async (req: NextRequest) => {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not initialized" }, { status: 500 });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado. Faça login novamente." }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "Texto vazio" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not configured");
    return NextResponse.json({ error: "Serviço de IA não configurado" }, { status: 503 });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are a CRM Data Extraction Specialist.

TASK: Extract business leads from the provided text into a JSON array.

INPUT TEXT:
"""
${text}
"""

OUTPUT REQUIREMENTS:
1. Return ONLY a valid JSON object.
2. NO markdown formatting.
3. Escape all special characters inside strings (especially newlines).
4. Strictly follow this schema:
{
  "summary": "string (summary in Portuguese)",
  "leads": [
    {
      "company_name": "string",
      "trade_name": "string",
      "website_url": "string",
      "instagram_url": "string",
      "city": "string",
      "uf": "string (2 letters)",
      "address": "string",
      "notes": "string",
      "contacts": [
        { "name": "string", "role": "string", "phone": "string", "email": "string", "is_primary": boolean }
      ]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResult = response.text();

    // Cleanup: Multiple strategies to extract valid JSON

    // Strategy 1: Try markdown code blocks first
    const jsonMatch = textResult.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      textResult = jsonMatch[1].trim();
    }

    // Strategy 2: Find first { and last } to extract JSON object
    const firstBrace = textResult.indexOf('{');
    const lastBrace = textResult.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace > firstBrace) {
      textResult = textResult.substring(firstBrace, lastBrace + 1);
    }

    // Sanitize: Remove bad control characters (keep \n, \r, \t)
    textResult = textResult.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    console.log("[parse-text] Cleaned AI response (first 300 chars):", textResult.substring(0, 300));
    console.log("[parse-text] Cleaned AI response (last 100 chars):", textResult.substring(textResult.length - 100));

    try {
      const data = JSON.parse(textResult);
      console.log("[parse-text] JSON parsed successfully! Leads count:", data.leads?.length || 0);
      return NextResponse.json(data);
    } catch (parseError) {
      console.error("[parse-text] JSON Parse Error:", parseError);
      console.error("[parse-text] Text length:", textResult.length);
      console.error("[parse-text] First 500 chars:", textResult.substring(0, 500));
      console.error("[parse-text] Last 500 chars:", textResult.substring(textResult.length - 500));
      return NextResponse.json({
        error: "IA retornou formato inválido. Tente novamente com texto mais estruturado."
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("[parse-text] AI API Error:", error.message || error);

    // Fallback: Local Regex Parser for simple testing when AI is capped or fails
    const errorMessage = (error.message || error.toString()).toLowerCase();

    if (errorMessage.includes('429') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('rate_limit') ||
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('googlegenerativeai error')) {

      console.log("[parse-text] Switching to Local Regex Fallback due to AI Error:", errorMessage);

      try {
        // Improved heuristic parser for the provided sample format
        // The format seems to be blocks of text separated by multiple newlines or distinct headers.
        // Key observation from user sample: Company names are often UPPERCASE or first line of a block.
        // Let's try to group lines more aggressively.

        const rawBlocks = text.split(/\n\s*\n\s*\n/); // Split by TRIPLE newlines first (often separates leads)
        // If triple split doesn't give much, fallback to double

        let blocks = rawBlocks.length > 2 ? rawBlocks : text.split(/\n\s*\n/);

        // Further refinement: Merge small fragmented blocks if they look like part of previous
        // This is hard with regex alone. Let's process line by line with a state machine.

        const leads = [];
        const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);

        let currentLead: any = { status: "NEW", source: "Import (Fallback)" };
        let currentLines: string[] = [];

        // Heuristic: A new lead starts when we see a line that looks like a Company Name (UPPERCASE > 3 chars)
        // AND we have accumulated some data for the previous lead.
        // OR if we hit a known "separator" pattern.

        const isProbablyCompany = (line: string) => {
          return line.length > 3 && line === line.toUpperCase() && !line.includes('@') && !line.includes('www') && !line.match(/\d/);
        };

        for (const line of lines) {
          // Logic to start new lead
          // If we see an UPPERCASE line and we already have significant data (like a contact or url) in current lead, assume new lead?
          // User sample: "CANNES\nEMPREENDIMENTOS" -> 2 lines uppercase.
          // "ABSOLUTA" -> 1 line.

          // Better approach for the fallback:
          // Just accept that without AI, perfect segmentation is hard.
          // But 126 leads for ~12 companies means it's splitting every line or so.
          // The previous code split by `\n\s*\n` which might have been true for every single line stroke in standard text editors copy-paste.

          // Let's rely on the provided text structure: 
          // Companies seem to be separated by more visual space, or maybe just look for keywords like "LANÇAMENTOS ATIVOS" as end of block?

          // Re-implementing block splitting with "lançamentos ativos" or "La=" or "LA=" as end-markers + blank lines pattern.

          if (currentLines.length > 0 && (isProbablyCompany(line) && !currentLines[currentLines.length - 1].match(/^[A-Z\s]+$/))) {
            // New start detected (Uppercase line follows non-uppercase line) - Likely new company
            if (currentLead.company_name || currentLead.instagram_url) {
              leads.push(processLeadLines(currentLines));
              currentLines = [];
            }
          }
          currentLines.push(line);
        }

        // Push last
        if (currentLines.length > 0) leads.push(processLeadLines(currentLines));

        // Helper to extract fields from a block of lines
        function processLeadLines(lines: string[]) {
          const lead: any = { company_name: '', status: "NEW", source: "Text Import (Fallback)", contacts: [], notes: '' };

          lines.forEach(line => {
            if (!lead.company_name && isProbablyCompany(line)) {
              lead.company_name = line;
            } else if (line.startsWith('@')) {
              lead.instagram_url = line;
            } else if (line.toLowerCase().includes('http') || line.toLowerCase().includes('www')) {
              lead.website_url = line;
            } else if ((line.includes('Rua') || line.includes('Avenida') || line.includes('Av.')) && line.match(/\d/)) {
              lead.address = line;
              // Extract City/UF logic
              const parts = line.split(/[-,]/);
              if (parts.length > 1) {
                const lastPart = parts[parts.length - 1].trim();
                if (lastPart.length === 2 && lastPart === lastPart.toUpperCase()) lead.uf = lastPart;
              }
            } else if (line.toLowerCase().includes('la=') || line.toLowerCase().includes('lançamentos')) {
              lead.notes = (lead.notes || '') + line + "\n";
            } else if (line.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/)) {
              // Phone number found
              const phone = line.match(/(\(?\d{2}\)?\s?\d{4,5}-?\d{4})/)?.[0];
              // Try to find name in the same line or previous line
              // For simplicity in fallback, just add as contact
              lead.contacts.push({ name: 'Contato Identificado', phone: phone, is_primary: lead.contacts.length === 0 });
            } else if (line.includes('@')) { // email (if not instagram)
              lead.contacts.push({ name: 'Email Found', email: line, is_primary: lead.contacts.length === 0 });
            } else {
              // Append to notes or generic info
              if (lead.company_name && lead.company_name !== line) {
                // Maybe trade name or garbage
                // limit noise
              }
            }
          });

          if (!lead.company_name) lead.company_name = lines[0] || 'Lead Sem Nome';
          return lead;
        }

        return NextResponse.json({
          summary: "⚠️ Modo Fallback (Cota de IA excedida). Processado localmente com heurística.",
          leads: leads
        });
      } catch (fallbackError) {
        console.error("Fallback failed", fallbackError);
      }
    }

    // Check for specific Gemini API errors
    if (error.message?.includes('API_KEY_INVALID')) {
      return NextResponse.json({ error: "Chave da API inválida" }, { status: 503 });
    }
    // The RATE_LIMIT/quota check is now handled by the fallback above, so this specific return is removed.
    if (error.message?.includes('SAFETY')) {
      return NextResponse.json({ error: "Conteúdo bloqueado pelo filtro de segurança" }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro ao processar texto com IA. Tente novamente." }, { status: 500 });
  }
});
