import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testLogin() {
    console.log('Testing login for joao@visualizen.com...')
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'joao@visualizen.com',
        password: 'Visualizen2026!'
    })

    if (error) {
        console.error('❌ Login failed:', error.message)
    } else {
        console.log('✅ Login successful! User ID:', data.user?.id)
    }
}

testLogin()
