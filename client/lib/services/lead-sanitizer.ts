/**
 * Allowlist of fields that exist in the Prisma Lead model.
 * Only these fields will be passed to Prisma.
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
    'segment_id',
    'status',
    'priority',
    'first_contact_date',
    'last_contact_date',
    'next_followup_date',
    'notes',
    'owner',
    'source',  // NEW: Fonte do lead
    'score',   // NEW: Pontuação calculada
    'uf',      // NEW: Estado
    'city',     // NEW: Cidade
]);

/**
 * Calculate lead score based on data completeness and checklist items.
 */
function calculateScore(data: any): number {
    let score = 0;

    // Basic info completeness
    if (data.email && data.email.trim().length > 5) score += 10;
    if (data.phone && String(data.phone).replace(/[^0-9]/g, '').length >= 8) score += 10;
    if (data.instagram_url && data.instagram_url.trim().length > 5) score += 10;
    if (data.website_url && data.website_url.trim().length > 5) score += 10;
    if (data.decision_maker) score += 10;

    // Render Quality (HIGH IMPACT)
    if (data.render_quality === 'GOOD') score += 30;
    if (data.render_quality === 'MEDIUM') score += 15;
    if (data.render_quality === 'BAD') score -= 10;

    // Checklist items (from extra_info or direct)
    const checklist = data.checklist || data.extra_info?.checklist || {};
    if (checklist.hasInstagram) score += 20;
    if (checklist.hasRender) score += 20;

    // Source bonus - some sources are higher quality
    if (data.source === 'instagram') score += 15;
    if (data.source === 'rede_joao' || data.source === 'rede_vitor') score += 10;

    return score;
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
            return trimmed === '' ? null : trimmed;
        }
        return value;
    }
}
