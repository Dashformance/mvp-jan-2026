import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function listAll() {
    console.log('Listing all users in Supabase Auth...')
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error('Error:', error.message)
        return
    }

    users.forEach(u => {
        console.log(`- ${u.email} (${u.id})`)
    })
}

listAll()
