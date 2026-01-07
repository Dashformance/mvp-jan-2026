/**
 * Allowlist of fields that exist in the Prisma Lead model.
 * Only these fields will be passed to Prisma.
 * Note: 'source', 'score' are added by sanitizer, 'segment_id' must use relation
 */
const ALLOWED_LEAD_FIELDS = new Set([
    'company_name',
    'trade_name',
    'cnpj',
    'phone',
    'email',
    'instagram_url',
    'website_url',
    'render_quality',
    'decision_maker',
    'extra_info',
    'status',
    'priority',
    'first_contact_date',
    'last_contact_date',
    'next_followup_date',
    'notes',
    'owner',
    'uf',
    'city',
]);

/**
 * Calculate lead score based on data completeness and checklist items.
 */
// Advanced P-Score Types
// V-Score Types
export interface QualificationData {
    visualization: { usesRender: boolean, usesVideo360: boolean, usesSalesImg: boolean };
    maturity: { hasWebsite: boolean, hasLPs: boolean, hasDigitalMats: boolean };
    structure: { multipleProjects: boolean, teamVisible: boolean, institutionalComm: boolean };
    scale: { multipleCities: boolean, portfolioHistory: boolean, continuousComm: boolean };
    financial: { highStandardVisual: boolean, investBranding: boolean, activeAds: boolean };
    techOpenness: { interactiveLinks: boolean, digitalTools: boolean, cxFocus: boolean };
    absoluteStar?: boolean;
}

/**
 * Calculate lead score based on V-Score Board rules (100 pts max)
 */
export function calculateAdvancedScore(data: any): number {
    let score = 0;
    const qual = (data.extra_info?.qualification || {}) as Partial<QualificationData>;

    // 1️⃣ Uso comprovado de visualização (Max 25)
    let s1 = 0;
    const vis = qual.visualization || {} as any;
    if (vis.usesRender) s1 += 10;
    if (vis.usesVideo360) s1 += 8;
    if (vis.usesSalesImg) s1 += 7;
    score += Math.min(s1, 25);

    // 2️⃣ Maturidade digital pública (Max 20)
    let s2 = 0;
    const mat = qual.maturity || {} as any;
    if (mat.hasWebsite || data.website_url) s2 += 6; // Auto-fill if field exists
    if (mat.hasLPs) s2 += 7;
    if (mat.hasDigitalMats) s2 += 7;
    score += Math.min(s2, 20);

    // 3️⃣ Estrutura empresarial dedutível (Max 15)
    let s3 = 0;
    const str = qual.structure || {} as any;
    if (str.multipleProjects) s3 += 6;
    if (str.teamVisible) s3 += 5;
    if (str.institutionalComm) s3 += 4;
    score += Math.min(s3, 15);

    // 4️⃣ Escala potencial do negócio (Max 15)
    let s4 = 0;
    const sca = qual.scale || {} as any;
    if (sca.multipleCities) s4 += 6;
    if (sca.portfolioHistory) s4 += 5;
    if (sca.continuousComm) s4 += 4;
    score += Math.min(s4, 15);

    // 5️⃣ Capacidade financeira inferida (Max 15)
    let s5 = 0;
    const fin = qual.financial || {} as any;
    if (fin.highStandardVisual) s5 += 6;
    if (fin.investBranding) s5 += 5;
    if (fin.activeAds) s5 += 4;
    score += Math.min(s5, 15);

    // 6️⃣ Abertura para tecnologia (Max 10)
    let s6 = 0;
    const tech = qual.techOpenness || {} as any;
    if (tech.interactiveLinks) s6 += 4;
    if (tech.digitalTools) s6 += 3;
    if (tech.cxFocus) s6 += 3;
    score += Math.min(s6, 10);

    if (qual.absoluteStar) {
        return 100;
    }

    return Math.min(score, 100);
}

/**
 * Legacy wrapper for backward compatibility
 */
function calculateScore(data: any): number {
    // If we have qualification data, use the advanced calculator
    if (data.extra_info?.qualification) {
        return calculateAdvancedScore(data);
    }

    // Otherwise, use a simplified version of the new logic based on available fields
    let score = 0;

    // Presence (Implied)
    if (data.instagram_url) score += 5;
    if (data.website_url) score += 8;

    // Experience (Legacy mapping)
    if (data.render_quality === 'GOOD') score += 15; // Premium + Uses
    else if (data.render_quality === 'MEDIUM') score += 7; // Uses

    return Math.min(score, 100);
}

export class LeadSanitizer {
    /**
     * Sanitizes data for creating a new Lead.
     * Ensures all fields are in the correct format and ONLY includes allowed fields.
     */
    static sanitizeForCreate(data: any): any {
        const sanitized: any = {};

        // Only copy allowed fields
        if (data.company_name) sanitized.company_name = String(data.company_name).trim();
        if (data.trade_name) sanitized.trade_name = String(data.trade_name).trim();

        // CNPJ - critical for unique constraint
        sanitized.cnpj = this.toNullIfEmpty(data.cnpj);

        // Status with default
        sanitized.status = data.status || 'NEW';

        // Optional string fields
        sanitized.phone = this.toNullIfEmpty(data.phone);
        sanitized.email = this.toNullIfEmpty(data.email);
        sanitized.decision_maker = this.toNullIfEmpty(data.decision_maker);
        sanitized.notes = this.toNullIfEmpty(data.notes);
        sanitized.segment_id = this.toNullIfEmpty(data.segment_id);
        sanitized.owner = this.toNullIfEmpty(data.owner);

        // NEW: Source field
        sanitized.source = this.toNullIfEmpty(data.source);

        // NEW: Social & Marketing
        sanitized.instagram_url = this.toNullIfEmpty(data.instagram_url);
        sanitized.website_url = this.toNullIfEmpty(data.website_url);
        sanitized.render_quality = this.toNullIfEmpty(data.render_quality);

        // NEW: Geography
        sanitized.uf = this.toNullIfEmpty(data.uf);
        sanitized.city = this.toNullIfEmpty(data.city);

        // Priority
        sanitized.priority = Number(data.priority) || 0;

        // JSON fields - store as JSON, not null
        sanitized.extra_info = data.extra_info || {};

        // Checklist goes into extra_info
        if (data.checklist) {
            sanitized.extra_info = { ...sanitized.extra_info, checklist: data.checklist };
        }

        // NEW: Calculate and set score
        sanitized.score = calculateScore({ ...data, extra_info: sanitized.extra_info });

        return sanitized;
    }

    /**
     * Sanitizes data for updating an existing Lead.
     * ONLY allows fields that exist in the Prisma schema.
     */
    static sanitizeForUpdate(data: any): any {
        const sanitized: any = {};

        // Only copy fields that are BOTH in data AND in the allowlist
        for (const key of Object.keys(data)) {
            if (ALLOWED_LEAD_FIELDS.has(key)) {
                sanitized[key] = data[key];
            }
        }

        // Normalize optional string fields to null if empty
        if (sanitized.phone !== undefined) sanitized.phone = this.toNullIfEmpty(sanitized.phone);
        if (sanitized.email !== undefined) sanitized.email = this.toNullIfEmpty(sanitized.email);
        if (sanitized.instagram_url !== undefined) sanitized.instagram_url = this.toNullIfEmpty(sanitized.instagram_url);
        if (sanitized.website_url !== undefined) sanitized.website_url = this.toNullIfEmpty(sanitized.website_url);
        if (sanitized.render_quality !== undefined) sanitized.render_quality = this.toNullIfEmpty(sanitized.render_quality);
        if (sanitized.decision_maker !== undefined) sanitized.decision_maker = this.toNullIfEmpty(sanitized.decision_maker);
        if (sanitized.notes !== undefined) sanitized.notes = this.toNullIfEmpty(sanitized.notes);
        if (sanitized.segment_id !== undefined) sanitized.segment_id = this.toNullIfEmpty(sanitized.segment_id);
        if (sanitized.cnpj !== undefined) sanitized.cnpj = this.toNullIfEmpty(sanitized.cnpj);
        if (sanitized.source !== undefined) sanitized.source = this.toNullIfEmpty(sanitized.source);
        if (sanitized.uf !== undefined) sanitized.uf = this.toNullIfEmpty(sanitized.uf);
        if (sanitized.city !== undefined) sanitized.city = this.toNullIfEmpty(sanitized.city);

        // Trim string fields
        if (typeof sanitized.company_name === 'string') sanitized.company_name = sanitized.company_name.trim();
        if (typeof sanitized.trade_name === 'string') sanitized.trade_name = sanitized.trade_name.trim();

        return sanitized;
    }

    private static toNullIfEmpty(value: any): string | null {
        if (value === undefined || value === null) return null;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            // Treat '-', '--', or empty as null
            if (trimmed === '' || trimmed === '-' || trimmed === '--') return null;
            return trimmed;
        }
        return value;
    }
}
