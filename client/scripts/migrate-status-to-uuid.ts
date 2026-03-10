import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const LEGACY_MAP: Record<string, string> = {
  'INBOX':        'fria',        // "Lista Fria"
  'NEW':          'qualificado', // "Qualificado"
  'ATTEMPTED':    'tentativa',   // "Tentativa"
  'CONTACTED':    'contatado',   // "Contatado"
  'MEETING':      'reuni',       // "Reunião"
  'WON':          'fechamento',  // "Em Fechamento"
  'SOLD':         'fechado',     // "Negócio Fechado"
  'LOST':         'perdido',     // "Perdido"
  'DISQUALIFIED': 'desqualificado',
};

async function main() {
  console.log('Fetching stages...');
  const stages = await prisma.stages.findMany({
    orderBy: { position: 'asc' }
  });

  if (stages.length === 0) {
    console.log('No stages found in database.');
    return;
  }

  const defaultStage = stages[0];
  let totalUpdated = 0;

  console.log('Fetching leads with legacy status...');
  // We cannot use strict type for status anymore as it might be UUIDs already,
  // but Prisma schema might still have it as String. 
  // Wait, leads schema still has status String.
  const leads = await prisma.leads.findMany();

  for (const lead of leads) {
    // Check if status is a legacy status
    const isLegacy = Object.keys(LEGACY_MAP).includes(lead.status) || !lead.status.includes('-');
    
    if (isLegacy) {
      const legacyKey = Object.keys(LEGACY_MAP).find(k => k === lead.status) || lead.status;
      const searchStr = LEGACY_MAP[legacyKey] || legacyKey.toLowerCase();
      
      let targetStage = stages.find(s => s.name.toLowerCase().includes(searchStr));
      if (!targetStage) targetStage = defaultStage;

      await prisma.leads.update({
        where: { id: lead.id },
        data: { status: targetStage.id }
      });
      totalUpdated++;
      console.log(`Updated lead ${lead.id} (${lead.status} -> ${targetStage.id})`);
    }
  }

  console.log(`Migration complete. Updated ${totalUpdated} leads.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
