import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(URL, SERVICE_KEY)

const EMAIL = 'joao@visualizen.com'
const PASS = 'Dash2026'

async function finalReset() {
    console.log(`🚀 Final password reset for: ${EMAIL} -> ${PASS}`)
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const user = users?.find(u => u.email === EMAIL)

    if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
            password: PASS,
            email_confirm: true
        })
        console.log('✅ Password set safely.')
    } else {
        console.error('❌ User not found!')
    }
}

finalReset()
