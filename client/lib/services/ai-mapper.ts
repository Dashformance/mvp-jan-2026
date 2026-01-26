import { GoogleGenerativeAI } from "@google/generative-ai";

interface MappingResult {
    mapping: Record<string, string>;
    confidence: number;
}

const SYSTEM_FIELDS: Record<string, string[]> = {
    company_name: ['razão social', 'razao social', 'empresa', 'nome da empresa', 'cliente', 'customer', 'business'],
    trade_name: ['nome fantasia', 'fantasia', 'marca'],
    cnpj: ['cnpj', 'cpf/cnpj', 'documento', 'doc'],
    phone: ['telefone', 'celular', 'whatsapp', 'whats', 'fone', 'tel', 'contato', 'whatsapp 1', 'telefone 1', 'celular 1'],
    email: ['email', 'e-mail', 'mail', 'correio eletronico', 'contato geral'],
    city: ['cidade', 'municipio', 'mun'],
    uf: ['uf', 'estado', 'est'],
    decision_maker: ['decisor', 'responsável', 'responsavel', 'contato principal', 'dono', 'sócio', 'socio', 'contato 1', 'nome'],
    notes: ['observações', 'obs', 'notas', 'detalhes', 'lançamentos', 'lançamentos ativos', 'status', 'info', 'extra']
};

export const AiMapper = {
    async analyzeHeaders(headers: string[]): Promise<MappingResult> {
        // 1. Try Heuristic First (Fast & Free)
        const heuristicResult = this.analyzeHeuristic(headers);

        // If high confidence, return immediately
        if (heuristicResult.confidence > 0.8) {
            return heuristicResult;
        }

        // 2. Try Gemini if API Key exists
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                return await this.analyzeWithGemini(headers, apiKey);
            } catch (error) {
                console.error("Gemini mapping failed, falling back to heuristic", error);
                return heuristicResult;
            }
        }

        return heuristicResult;
    },

    analyzeHeuristic(headers: string[]): MappingResult {
        const mapping: Record<string, string> = {};
        let matches = 0;

        headers.forEach(header => {
            const normalizedHeader = header.toLowerCase().trim();
            for (const [sysField, aliases] of Object.entries(SYSTEM_FIELDS)) {
                if (aliases.some(alias => normalizedHeader.includes(alias) || alias.includes(normalizedHeader))) {
                    if (!Object.values(mapping).includes(header)) {
                        mapping[sysField] = header;
                        matches++;
                        break;
                    }
                }
            }
        });

        const confidence = headers.length > 0 ? (matches / headers.length) : 0;
        return {
            mapping,
            confidence: Math.min(confidence + 0.2, 1)
        };
    },

    async analyzeWithGemini(headers: string[], apiKey: string): Promise<MappingResult> {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const systemFieldsList = Object.keys(SYSTEM_FIELDS).join(', ');
        const prompt = `
        You are a data mapping assistant. Map the provided CSV headers to the following system fields: [${systemFieldsList}].
        
        CSV Headers: ${JSON.stringify(headers)}
        
        Rules:
        1. Return ONLY a JSON object where keys are system fields and values are the matching CSV header.
        2. If no match found for a system field, omit it.
        3. Do not invent headers.
        4. "confidence" should be a number between 0 and 1 indicating how sure you are.
        
        Output format: { "mapping": { "system_field": "csv_header" }, "confidence": 0.9 }
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Basic cleanup of markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(jsonStr);
            return {
                mapping: parsed.mapping || {},
                confidence: parsed.confidence || 0.5
            };
        } catch (e) {
            throw new Error("Failed to parse AI response");
        }
    }
};
