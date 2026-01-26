import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(URL, SERVICE_KEY)

const USERS = [
    'joao@visualizen.com',
    'bruno@visualizen.com',
    'nitz@visualizen.com' // Vitor (assuming nitz@ is the email based on previous lists)
]
const NEW_PASSWORD = '@VISUALIZEN123'

async function batchReset() {
    console.log(`🚀 Resetting passwords to: ${NEW_PASSWORD}`)

    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    if (listError) {
        console.error('Error listing users:', listError.message)
        return
    }

    for (const email of USERS) {
        const user = users?.find(u => u.email === email)
        if (user) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
                password: NEW_PASSWORD,
                email_confirm: true
            })
            if (error) {
                console.error(`❌ Failed to reset ${email}:`, error.message)
            } else {
                console.log(`✅ Success for: ${email}`)
            }
        } else {
            console.warn(`⚠️ User not found: ${email}`)
        }
    }
}

batchReset()
