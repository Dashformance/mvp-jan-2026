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
    'LOST',
    'DISQUALIFIED'
]);

// Schema for updating a Lead (PATCH)
// All fields are optional since it's a partial update
// Using .passthrough() to allow extra fields (LeadSanitizer strips them before DB)
export const LeadUpdateSchema = z.object({
    company_name: z.string().min(1).optional().nullable(),
    trade_name: z.string().optional().nullable(),
    cnpj: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    instagram_url: z.string().optional().nullable(),
    website_url: z.string().optional().nullable(),
    render_quality: z.enum(['GOOD', 'MEDIUM', 'BAD']).optional().nullable(),
    decision_maker: z.string().optional().nullable(),
    status: LeadStatusSchema.optional(),
    priority: z.number().int().min(0).max(10).optional(),
    notes: z.string().optional().nullable(),
    owner: z.string().optional().nullable(),
    uf: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    segment_id: z.string().uuid().optional().nullable(),

    // JSON fields - allow null
    extra_info: z.record(z.string(), z.any()).optional().nullable(),
    checklist: z.record(z.string(), z.any()).optional().nullable(),

    // Dates (string ISO format from frontend)
    first_contact_date: z.string().datetime().optional().nullable(),
    last_contact_date: z.string().datetime().optional().nullable(),
    next_followup_date: z.string().datetime().optional().nullable(),
}).passthrough(); // Allow extra fields, LeadSanitizer will strip them

// Schema for creating a Lead (POST)
export const LeadCreateSchema = z.object({
    company_name: z.string().min(1).optional().nullable(),
    trade_name: z.string().optional().nullable(),
    cnpj: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    instagram_url: z.string().optional().nullable(),
    website_url: z.string().optional().nullable(),
    render_quality: z.enum(['GOOD', 'MEDIUM', 'BAD']).optional().nullable(),
    decision_maker: z.string().optional().nullable(),
    status: LeadStatusSchema.optional().default('NEW'),
    priority: z.number().int().min(0).max(10).optional().default(0),
    notes: z.string().optional().nullable(),
    owner: z.string().optional().nullable(),
    uf: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    segment_id: z.string().uuid().optional().nullable(),
    extra_info: z.record(z.string(), z.any()).optional().nullable(),
    checklist: z.record(z.string(), z.any()).optional().nullable(),
}).passthrough();

export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>;
export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
