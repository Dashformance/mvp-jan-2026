-- MIGRAÇÃO DEFINITIVA: ARQUITETURA DE NÍVEIS (LEVEL ARCHITECTURE)
-- Este script reconstrói as stages com IDs estáveis (nivel_1, nivel_2, etc.)
-- E migra os leads para esses novos IDs.

DO $$
BEGIN
    -- 1. Limpar stages atuais
    DELETE FROM "public"."stages";

    -- 2. Criar as 9 stages padrão com IDs de "Nível"
    INSERT INTO "public"."stages" ("id", "name", "phase", "color", "position", "is_win_stage", "is_lost_stage", "updated_at") VALUES
    ('nivel_1', '❄️ Lista Fria', 'INBOX', 'bg-slate-500/10 text-slate-400 border-slate-500/20', 0, false, false, NOW()),
    ('nivel_2', '✅ Qualificado', 'NEW', 'bg-blue-500/10 text-blue-400 border-blue-500/20', 1, false, false, NOW()),
    ('nivel_3', '📞 Tentativa', 'ATTEMPTED', 'bg-amber-500/10 text-amber-400 border-amber-500/20', 2, false, false, NOW()),
    ('nivel_4', '💬 Contatado', 'CONTACTED', 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', 3, false, false, NOW()),
    ('nivel_5', '📅 Reunião', 'MEETING', 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', 4, false, false, NOW()),
    ('nivel_6', '💰 Em Fechamento', 'WON', 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', 5, false, false, NOW()),
    ('nivel_7', '🏆 Negócio Fechado', 'SOLD', 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', 6, true, false, NOW()),
    ('nivel_8', '🔻 Perdido', 'LOST', 'bg-rose-500/10 text-rose-400 border-rose-500/20', 7, false, true, NOW()),
    ('nivel_9', '🚫 Desqualificado', 'DISQUALIFIED', 'bg-gray-500/10 text-gray-500 border-gray-500/20', 8, false, true, NOW());

    -- 3. Migrar os leads dos status legados para os novos níveis
    UPDATE "public"."leads" SET "status" = 'nivel_1' WHERE "status" = 'INBOX';
    UPDATE "public"."leads" SET "status" = 'nivel_2' WHERE "status" = 'NEW' OR "status" = 'QUALIFIED';
    UPDATE "public"."leads" SET "status" = 'nivel_3' WHERE "status" = 'ATTEMPTED';
    UPDATE "public"."leads" SET "status" = 'nivel_4' WHERE "status" = 'CONTACTED';
    UPDATE "public"."leads" SET "status" = 'nivel_5' WHERE "status" = 'MEETING';
    UPDATE "public"."leads" SET "status" = 'nivel_6' WHERE "status" = 'CLOSING' OR "status" = 'NEGOTIATION';
    UPDATE "public"."leads" SET "status" = 'nivel_7' WHERE "status" = 'WON' OR "status" = 'SOLD';
    UPDATE "public"."leads" SET "status" = 'nivel_8' WHERE "status" = 'LOST';
    UPDATE "public"."leads" SET "status" = 'nivel_9' WHERE "status" = 'DISQUALIFIED';

    -- 4. Backup: qualquer lead que ainda não tenha UUID ou nível válido, vai para o nivel 1 (Inbox)
    UPDATE "public"."leads" SET "status" = 'nivel_1' WHERE "status" NOT LIKE 'nivel_%';

    RAISE NOTICE 'Nível Architecture implantada com sucesso!';
END $$;
