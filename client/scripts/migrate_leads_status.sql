-- MIGRAÇÃO DE STATUS LEGADO PARA UUID
-- Execute este script no SQL Editor do Supabase

DO $$
DECLARE
    id_fria UUID;
    id_qualificado UUID;
    id_tentativa UUID;
    id_contatado UUID;
    id_reuniao UUID;
    id_fechamento UUID;
    id_fechado UUID;
    id_perdido UUID;
    id_desqualificado UUID;
BEGIN
    -- Capturar os IDs das stages atuais (baseado em nomes aproximados)
    SELECT id INTO id_fria FROM stages WHERE name ILIKE '%Lista Fria%' OR name ILIKE '%Inbox%' LIMIT 1;
    SELECT id INTO id_qualificado FROM stages WHERE name ILIKE '%Qualificado%' OR name ILIKE '%Novo%' LIMIT 1;
    SELECT id INTO id_tentativa FROM stages WHERE name ILIKE '%Tentativa%' LIMIT 1;
    SELECT id INTO id_contatado FROM stages WHERE name ILIKE '%Contatado%' LIMIT 1;
    SELECT id INTO id_reuniao FROM stages WHERE name ILIKE '%Reuniã%' LIMIT 1;
    SELECT id INTO id_fechamento FROM stages WHERE name ILIKE '%Em Fechamento%' LIMIT 1;
    SELECT id INTO id_fechado FROM stages WHERE name ILIKE '%Fechado%' OR name ILIKE '%Vendido%' LIMIT 1;
    SELECT id INTO id_perdido FROM stages WHERE name ILIKE '%Perdido%' LIMIT 1;
    SELECT id INTO id_desqualificado FROM stages WHERE name ILIKE '%Desqualificado%' LIMIT 1;

    -- Atualizar Leads
    UPDATE leads SET status = id_fria WHERE status = 'INBOX';
    UPDATE leads SET status = id_qualificado WHERE status = 'NEW';
    UPDATE leads SET status = id_tentativa WHERE status = 'ATTEMPTED';
    UPDATE leads SET status = id_contatado WHERE status = 'CONTACTED';
    UPDATE leads SET status = id_reuniao WHERE status = 'MEETING';
    UPDATE leads SET status = id_fechamento WHERE status = 'WON';
    UPDATE leads SET status = id_fechado WHERE status = 'SOLD';
    UPDATE leads SET status = id_perdido WHERE status = 'LOST';
    UPDATE leads SET status = id_desqualificado WHERE status = 'DISQUALIFIED';

    -- Se algum lead ainda estiver sem UUID (status não mapeado), colocar no Inbox por padrão
    UPDATE leads SET status = id_fria WHERE status NOT LIKE '%-%' AND status IS NOT NULL;

    RAISE NOTICE 'Migração concluída com sucesso!';
END $$;
