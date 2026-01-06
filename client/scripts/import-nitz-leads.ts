import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.resolve(__dirname, '../../LEADS TAB 01.csv');
    console.log(`Reading CSV from: ${csvPath}`);

    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found!');
        process.exit(1);
    }

    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');

    // Skip first two lines (Header and Column Names)
    const dataLines = lines.slice(2);
    let count = 0;
    let errors = 0;

    for (const line of dataLines) {
        if (!line.trim()) continue;

        const columns = line.split(';');
        if (columns.length < 3) continue;

        const nome = columns[0].trim();
        const cidade = columns[1].trim();
        const whatsapp = columns[2].trim();
        const imagensNota = columns[3].trim();
        const seguidores = columns[4].trim();
        const primeiroContato = columns[5].trim();
        const observacoes = columns[6].trim();
        const responsavel = columns[7].trim();

        if (!nome) continue;

        // Cleanup phone
        const cleanPhone = whatsapp.replace(/\D/g, '');

        // Has Render logic
        const hasRender = imagensNota.includes('*');

        // Score calculation (simple version for the script insert)
        let score = 0;
        if (cleanPhone) score += 10;
        if (hasRender) score += 20;
        score += 15; // rede_vitor bonus

        // Checklist structure
        const checklist = {
            hasInstagram: true, // They came from Instagram analysis
            hasRender: hasRender
        };

        // Extra info
        const extra_info = {
            followers_raw: seguidores,
            imported_from: 'LEADS TAB 01.csv',
            checklist: checklist // Nested here for Prisma
        };

        try {
            // Upsert by CNPJ is common, but here we don't have CNPJ. 
            // We'll use a dummy unique CNPJ based on name to prevent duplicates if script runs twice.
            const dummyCnpj = `NITZ-${nome.toUpperCase()}`;

            await prisma.lead.upsert({
                where: { cnpj: dummyCnpj },
                update: {
                    status: 'NEW', // Keep it in Qualified Pipeline
                },
                create: {
                    company_name: nome,
                    trade_name: nome,
                    cnpj: dummyCnpj,
                    phone: cleanPhone || null,
                    uf: cidade || null,
                    notes: observacoes || null,
                    owner: responsavel.toLowerCase().includes('joão') ? 'joao' : 'vitor',
                    status: 'NEW',
                    source: 'rede_vitor',
                    score: score,
                    extra_info: extra_info as any,
                    // If date is "20-jan.", attempt to set it for 2026-01-20
                    first_contact_date: null
                }
            });
            count++;
            if (count % 10 === 0) console.log(`Imported ${count} leads...`);
        } catch (err) {
            console.error(`Error importing ${nome}:`, err);
            errors++;
        }
    }

    console.log(`\nImport finished!`);
    console.log(`Successfully imported/updated: ${count}`);
    console.log(`Errors: ${errors}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
