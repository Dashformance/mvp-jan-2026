
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PIPELINE_COLUMNS = [
    { id: "INBOX", title: "❄️ Lista Fria", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
    { id: "NEW", title: "✅ Qualificado", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { id: "ATTEMPTED", title: "📞 Tentativa", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { id: "CONTACTED", title: "💬 Contatado", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" },
    { id: "MEETING", title: "📅 Reunião", color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    { id: "WON", title: "💰 Fechamento", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    { id: "LOST", title: "🔻 Perdido", color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    { id: "DISQUALIFIED", title: "🚫 Desqualificado", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
];

async function main() {
    console.log('Seeding stages...');

    // Clear existing stages to avoid duplicates during dev
    await prisma.stages.deleteMany({});

    for (const [index, col] of PIPELINE_COLUMNS.entries()) {
        await prisma.stages.create({
            data: {
                name: col.id, // ID used as name for mapping
                phase: col.title, // Title used as phase (label)
                color: col.color,
                position: index,
            }
        });
        console.log(`Created stage: ${col.title}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
