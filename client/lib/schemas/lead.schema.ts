import { z } from 'zod';

// Lead Status Enum
const LeadStatusSchema = z.enum([
    'INBOX',
    'SCREENING',
    'NEW',
    'ATTEMPTED',
    'CONTACTED',
    'MEETING',
    'WON',
    'SOLD',
    'LOST',
    'DISQUALIFIED'
]);

// Utility to handle empty strings as null
const emptyToNull = (val: any) => (val === "" || val === undefined ? null : val);

// Schema for updating a Lead (PATCH)
export const LeadUpdateSchema = z.object({
    company_name: z.string().min(1).optional().nullable(),
    trade_name: z.preprocess(emptyToNull, z.string().optional().nullable()),
    cnpj: z.preprocess(emptyToNull, z.string().optional().nullable()),
    phone: z.preprocess(emptyToNull, z.string().optional().nullable()),
    email: z.preprocess(emptyToNull, z.string().optional().nullable()),
    instagram_url: z.preprocess(emptyToNull, z.string().optional().nullable()),
    website_url: z.preprocess(emptyToNull, z.string().optional().nullable()),
    render_quality: z.preprocess(emptyToNull, z.enum(['GOOD', 'MEDIUM', 'BAD']).optional().nullable()),
    decision_maker: z.preprocess(emptyToNull, z.string().optional().nullable()),
    status: LeadStatusSchema.optional(),
    priority: z.coerce.number().int().min(0).max(10).optional(),
    notes: z.preprocess(emptyToNull, z.string().optional().nullable()),
    owner: z.preprocess(emptyToNull, z.string().optional().nullable()),
    owner_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    is_starred: z.boolean().optional(),
    uf: z.preprocess(emptyToNull, z.string().optional().nullable()),
    city: z.preprocess(emptyToNull, z.string().optional().nullable()),
    segment_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),

    // JSON fields - allow null
    extra_info: z.record(z.string(), z.any()).optional().nullable(),
    checklist: z.record(z.string(), z.any()).optional().nullable(),

    // Dates (string ISO format from frontend)
    first_contact_date: z.string().datetime().optional().nullable(),
    last_contact_date: z.string().datetime().optional().nullable(),
    next_followup_date: z.string().datetime().optional().nullable(),
    contract_value: z.preprocess((v) => {
        if (v === "" || v === null || v === undefined) return null;
        if (typeof v === 'string') {
            const num = parseFloat(v.replace(/\./g, "").replace(",", "."));
            return isNaN(num) ? null : num;
        }
        return v;
    }, z.number().optional().nullable()),
}).passthrough(); // Allow extra fields, LeadSanitizer will strip them

// Schema for creating a Lead (POST)
export const LeadCreateSchema = z.object({
    company_name: z.string().min(1).optional().nullable(),
    trade_name: z.preprocess(emptyToNull, z.string().optional().nullable()),
    cnpj: z.preprocess(emptyToNull, z.string().optional().nullable()),
    phone: z.preprocess(emptyToNull, z.string().optional().nullable()),
    email: z.preprocess(emptyToNull, z.string().optional().nullable()),
    instagram_url: z.preprocess(emptyToNull, z.string().optional().nullable()),
    website_url: z.preprocess(emptyToNull, z.string().optional().nullable()),
    render_quality: z.preprocess(emptyToNull, z.enum(['GOOD', 'MEDIUM', 'BAD']).optional().nullable()),
    decision_maker: z.preprocess(emptyToNull, z.string().optional().nullable()),
    status: LeadStatusSchema.optional().default('NEW'),
    priority: z.coerce.number().int().min(0).max(10).optional().default(0),
    notes: z.preprocess(emptyToNull, z.string().optional().nullable()),
    owner: z.preprocess(emptyToNull, z.string().optional().nullable()),
    owner_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    uf: z.preprocess(emptyToNull, z.string().optional().nullable()),
    city: z.preprocess(emptyToNull, z.string().optional().nullable()),
    segment_id: z.preprocess(emptyToNull, z.string().uuid().optional().nullable()),
    extra_info: z.record(z.string(), z.any()).optional().nullable(),
    checklist: z.record(z.string(), z.any()).optional().nullable(),
    is_starred: z.boolean().optional().default(false),
    contract_value: z.preprocess((v) => {
        if (v === "" || v === null || v === undefined) return 0;
        if (typeof v === 'string') {
            const num = parseFloat(v.replace(/\./g, "").replace(",", "."));
            return isNaN(num) ? 0 : num;
        }
        return v;
    }, z.number().optional().default(0).nullable()),
}).passthrough();

export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>;
export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
