
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const csvData = `Empresa,Website,Instagram,Endereço,Lançamentos Ativos,Contato 1,Cargo 1,Telefone 1,Email 1,Contato 2,Cargo 2,Telefone 2,Email 2,Contato 3,Cargo 3,Telefone 3,Email 3,Contato 4,Cargo 4,Telefone 4,Email 4,Contato 5,Cargo 5,Telefone 5,Email 5,Contato 6,Cargo 6,Telefone 6,Email 6,Fonte,Data de Coleta,Responsável
Cannes Empreendimentos,https://cannesempreendimentos.com.br/,@cannesempreendimentos,"Rua 904, 601, Centro, Bal. Camboriú - SC",-,Débora Canei,Comercial,(47) 99171-1036,contato@cannesempreendimentos.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Hendel Incorporações,www.hendelconstrucoes.com.br/,@hendel.incorporadora,"Rua Doutor Manoel Pedro, 364, Cabral, Curitiba - PR",1 - Curitiba/PR,Lucas de Oliveira,Comercial,(41) 99722-8979,lucas.mendes@hendelconstrucoes.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Absoluta,https://www.absolutaincorporadora.com.br/,@absolutaincorporadora,"Av. Carlos Drummond de Andrade, 813, Praia dos Amores, Bal. Camboriú - SC",8 - Itajaí/SC,Ana Ranien,Recepcionista,(47) 99134-9272,ana.ranien@absolutaincorporadora.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
BE - A Moradia do Futuro,https://amoradiadofuturo.com.br/,@amoradiadofuturo,"Av. Joaquim Duarte Moleirinho, 2319, Zona 3, Maringá - PR",5 - Maringá/PR,Gustavo Ducca,Comercial,(43) 99804-8737,gustavo.d@edificabpo.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Blend Incorporadora,www.blendincorporadora.com.br,@blend.incorporadora,"Rua Orleans, 1005, Bairro América, Joinville - SC",3 - Barra Velha/SC,Walmor Favero,Comercial,(47) 99293-7603,walmor@blendincorporadora.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
CK Construções e Empreendimentos,construtorack.com.br,@construtorack,"Av. Osvaldo Reis, 3281, Balneário Santa Clara, Itajaí - SC",6 - Bal. Camboriú e Itajaí/SC,Comercial,Comercial,(47) 99266-2499,comercial@construtorack.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Inbrasul Empreendimentos,https://www.inbrasul.com.br/,-,"Av. Conselheiro João Gaya, 760, Centro, Navegantes - SC",4 - Navegantes/SC,Marlon,Comercial,(47) 99142-7387,marlon@inbrasul.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Mondo Empreendimentos,www.mondoconstrutora.com.br,-,"Rua Julieta Lins, 300, Centro, Bal. Camboriú - SC",2 - Bal. Camboriú/SC,Aimar,Comercial,(47) 98420-8000,mondoempreendimentos@gmail.com,Gesiane,Comercial,(47) 99636-9007,-,,,,,,,,,,,,,,,DWV,11/01/2026,João
Neoprime Empreendimentos,https://www.neoprimeempreendimentos.com.br,@neoprimeempreendimentos,"Rua 220, 348, Meia Praia, Itapema - SC",8 - Itapema e Porto Belo/SC,Taimara,Gerente Comercial,(47) 98839-7842,vendas@neoprimeempreendimentos.com.br,Victória,Suporte Comercial,(47) 99942-2378,-,,,,,,,,,,,,,,,DWV,11/01/2026,João
Porto Valente Construtora,www.portovalenteconstrutora.com.br,@portovalenteconstrutora,"Rua 406 - A, 570, Morretes, Itapema - SC",4 - Itapema e Porto Belo/SC,Comercial,Comercial,(47) 99905-7212,comercial@portovalenteconstrutora.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Proedi Empreendimentos,https://proediempreendimentos.com.br/,@proediempreendimentos,"Rua 3000, 218, Centro, Bal. Camboriú - SC",1 - Bal. Camboriú/SC,Giovanni Spricigo,Projetos,(47) 98908-3653,projetos@proediempreendimentos.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
Quanta Empreendimentos,https://quantaempreendimentos.com/,@quantaempreendimentos,"Rua 1500, 820, Centro, Bal. Camboriú - SC",4 - Bal. Camboriú/SC e Belém/PA,Peterson Orcy,Comercial,(47) 99122-5566,peterson@quantaempreendimentos.com,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
RF & Bertemes Empreendimentos,https://www.rfbertemes.com.br/,@rfbertemes,"Rua 293, 210, Meia Praia, Itapema - SC","5 - Tijucas, Itapema, São João Batista/SC",Miguel De Almeida,Diretor Comercial,(47) 99250-3835,miguelrfbertemes@hotmail.com,Aline Claudino,Comercial,(47) 98870-6993,rfbertemes@hotmail.com,RF & Bertemes,Geral,(47) 99656-6149,rfbertemes@hotmail.com,,,,,,,,,,,DWV,11/01/2026,João
SK Dellagnelo Empreendimentos,https://www.skdellagnelo.com.br/empresa,@s.k.dellagnelo,"Rua 264, 41, Meia Praia, Itapema - SC",2 - Itapema/SC,Gabriel,Comercial,(47) 99622-8637,skdellagnelo@gmail.com,Ronaldo,Comercial,(47) 99991-8699,-,,,,,,,,,,,,,,,DWV,11/01/2026,João
Zig Empreendimentos,-,@zigempreendimentos,"Rua Rubens Alves, 162, Perequê, Porto Belo - SC",5 - Porto Belo/SC,Jéssica Curi,Comercial,(47) 99266-3288,Jessicavitorinocuri@gmail.com,Edson,Comercial,(48) 9928-3776,-,Carol Iezan,Comercial,(48) 99180-3685,-,Giliardi Peixe,Comercial,(47) 98846-0094,-,Victor Hugo,Comercial,(47) 99282-6366,-,Geral,Geral,(47) 99171-6538,-,DWV,11/01/2026,João
Monarca Empreendimentos,www.monarca.com.br,-,"Av. Sete de Setembro, 4064, Centro, Curitiba - PR",3 - Curitiba/PR,Ivo Antunes,Comercial,(41) 99761-2817,monarca.plataforma@gmail.com,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
A2D Construtora,-,-,"Rua Marrocos, 470, Bairro das Nações, Bal. Camboriú - SC",1 - Bal. Camboriú/SC,Ussama Abdallah,Comercial,(47) 99967-7885,ussama@a2dconstrutora.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João
ABC Empreendimentos,abcempreendimentos.com.br,@abcempreendimentos,"Av. Nereu Ramos, 544, Centro, Itapema - SC","7 - Bal. Camboriú, Itajaí e Itapema/SC",Luiz Rodrigues,Comercial,(51) 9437-3544,luiz.rodrigues@abcempreendimentos.com.br,,,,,,,,,,,,,,,,,,,DWV,11/01/2026,João`

function parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function importLeads() {
    const lines = csvData.split('\n');
    const headers = parseCSVLine(lines[0]);
    console.log('Headers:', headers);

    const dataLines = lines.slice(1);
    let successCount = 0;

    for (const line of dataLines) {
        if (!line.trim()) continue;

        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        // Map columns (Indices based on CSV string provided)
        const company = cols[0];
        const website = cols[1] === '-' ? null : cols[1];
        const instagram = cols[2] === '-' ? null : cols[2];
        const address = cols[3];
        const activeLaunches = cols[4];

        // Contacts start at index 5, groups of 4 (Name, Role, Phone, Email)
        // 6 Contacts max
        // Contact 1: 5, 6, 7, 8
        // Contact 2: 9, 10, 11, 12
        // etc...

        const source = cols[cols.length - 3]; // DWV
        const dateStr = cols[cols.length - 2]; // 11/01/2026
        const ownerName = cols[cols.length - 1]; // João

        // Parse Address
        let city = null;
        let uf = null;
        if (address && address.includes('-')) {
            const parts = address.split('-');
            const ufPart = parts[parts.length - 1].trim();
            if (ufPart.length === 2) {
                uf = ufPart;
                // Try to get city from part before UF
                // "Rua..., Bal. Camboriú - SC"
                const addressParts = parts[parts.length - 2].split(',');
                city = addressParts[addressParts.length - 1].trim();
            }
        }

        // Parse Owner
        const owner = ownerName.toLowerCase() === 'joão' ? 'joao' : 'vitor';

        // Generate ID/CNPJ if missing
        // Using a fake CNPJ generator for uniqueness if real one isn't there
        const cnpj = `IMP-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        try {
            // Create Lead
            const lead = await prisma.leads.create({
                data: {
                    id: randomUUID(),
                    company_name: company,
                    trade_name: company,
                    cnpj: cnpj,
                    source: source,
                    website_url: website,
                    instagram_url: instagram,
                    city: city || address, // Fallback to full address if city parse fails
                    uf: uf,
                    owner: owner,
                    status: 'NEW', // Default status
                    extra_info: {
                        active_launches: activeLaunches,
                        full_address: address
                    },
                    date_added: new Date(),
                }
            });

            // Create Contacts
            const contacts = [];
            for (let i = 0; i < 6; i++) {
                const baseIdx = 5 + (i * 4);
                if (baseIdx >= cols.length) break;

                const name = cols[baseIdx];
                if (!name || name === '-' || name === '') continue;

                const role = cols[baseIdx + 1] === '-' ? null : cols[baseIdx + 1];
                const phone = cols[baseIdx + 2] === '-' ? null : cols[baseIdx + 2];
                const email = cols[baseIdx + 3] === '-' ? null : cols[baseIdx + 3];

                contacts.push({
                    id: randomUUID(),
                    updated_at: new Date(),
                    lead_id: lead.id,
                    name,
                    role,
                    phone,
                    email,
                    is_primary: i === 0 // First one is primary
                });
            }

            if (contacts.length > 0) {
                await prisma.contacts.createMany({
                    data: contacts
                });
            }

            // Sync legacy fields for compatibility
            if (contacts.length > 0) {
                const primary = contacts[0];
                await prisma.leads.update({
                    where: { id: lead.id },
                    data: {
                        decision_maker: primary.name,
                        phone: primary.phone,
                        email: primary.email
                    }
                });
            }

            console.log(`✅ Imported: ${company}`);
            successCount++;

        } catch (error) {
            console.error(`❌ Failed to import ${company}:`, error);
        }
    }

    console.log(`\n🎉 Finished! Imported ${successCount} leads.`);
}

importLeads()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
