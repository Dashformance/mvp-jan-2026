import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const prisma = new PrismaClient()

const TARGET_EMAIL = 'joao@visualizen.com'
const NEW_PASSWORD = 'Visualizen2026!'

async function main() {
    console.log(`🚀 Resetting password for: ${TARGET_EMAIL}`)

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    const authUser = users?.find(u => u.email === TARGET_EMAIL)

    if (!authUser) {
        throw new Error('User not found. Please run force-user.ts first.')
    }

    // Update password AND confirm email explicitly
    const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
        password: NEW_PASSWORD,
        email_confirm: true
    })

    if (updateError) throw updateError

    console.log('✅ Password reset successfully.')
    console.log(`Login: ${TARGET_EMAIL}`)
    console.log(`New Password: ${NEW_PASSWORD}`)
}

main()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect()
    })
