import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabaseAdmin = createClient(URL, SERVICE_KEY)
const supabaseAnon = createClient(URL, ANON_KEY)

const EMAIL = 'joao@visualizen.com'
const PASS = 'Digital2026!' // Mudando para uma nova só pra garantir

async function verify() {
    console.log(`--- Iniciando verificação para ${EMAIL} ---`)

    // 1. Forçar update com Admin
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email === EMAIL)

    if (!user) {
        console.log('Usuário não encontrado. Criando novo...')
        await supabaseAdmin.auth.admin.createUser({
            email: EMAIL,
            password: PASS,
            email_confirm: true
        })
    } else {
        console.log('Usuário encontrado. Resetando senha...')
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: PASS,
            email_confirm: true
        })
    }

    console.log('--- Aguardando 2 segundos para propagação ---')
    await new Promise(r => setTimeout(r, 2000))

    // 2. Tentar login com ANON (mesma chave do frontend)
    console.log('Tentando login com as novas credenciais...')
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
        email: EMAIL,
        password: PASS
    })

    if (error) {
        console.error('❌ ERRO NO LOGIN DE TESTE:', error.message)
    } else {
        console.log('✅ LOGIN DE TESTE SUCESSO! UID:', data.user?.id)
        console.log('------------------------------------------')
        console.log(`USE ESTAS CREDENCIAIS NO SITE:`)
        console.log(`Email: ${EMAIL}`)
        console.log(`Senha: ${PASS}`)
        console.log('------------------------------------------')
    }
}

verify()
