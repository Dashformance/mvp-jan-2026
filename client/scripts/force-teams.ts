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
    'vitor@visualizen.com'
]
const NEW_PASSWORD = '@VISUALIZEN123'

async function forceUsers() {
    console.log(`🚀 Forcing users and password: ${NEW_PASSWORD}`)

    for (const email of USERS) {
        console.log(`Processing: ${email}...`)

        // Check if user exists
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = users?.find(u => u.email === email)

        if (existingUser) {
            // Update
            const { error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: NEW_PASSWORD,
                email_confirm: true
            })
            if (error) console.error(`❌ Error updating ${email}:`, error.message)
            else console.log(`✅ Updated: ${email}`)
        } else {
            // Create
            const { error } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: NEW_PASSWORD,
                email_confirm: true
            })
            if (error) console.error(`❌ Error creating ${email}:`, error.message)
            else console.log(`✅ Created: ${email}`)
        }
    }
}

forceUsers()
