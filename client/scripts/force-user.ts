import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import { randomUUID } from 'crypto'

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const prisma = new PrismaClient()

const TARGET_EMAIL = 'joao@visualizen.com'
const TARGET_NAME = 'João Vitor'
const PASSWORD = '@VISUALIZEN1'

async function main() {
    console.log(`🚀 Forcing user creation/update for: ${TARGET_EMAIL}`)

    // 1. Check/Create in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    let authUser = users?.find(u => u.email === TARGET_EMAIL)

    if (!authUser) {
        console.log('Creating auth user...')
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: TARGET_EMAIL,
            password: PASSWORD,
            email_confirm: true,
            user_metadata: { name: TARGET_NAME, role: 'admin' }
        })
        if (createError) throw createError
        authUser = createData.user
        console.log('Auth user created successfully.')
    } else {
        console.log('User exists. Updating password...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
            password: PASSWORD,
            user_metadata: { name: TARGET_NAME, role: 'admin' }
        })
        if (updateError) throw updateError
        console.log('Password updated successfully.')
    }

    if (!authUser) throw new Error('Failed to get auth user')

    // 2. Sync with Prisma
    console.log('Syncing with Prisma...')
    const dbUser = await prisma.user.upsert({
        where: { email: TARGET_EMAIL },
        update: {
            supabase_uid: authUser.id,
            name: TARGET_NAME,
            role: 'admin'
        },
        create: {
            id: randomUUID(),
            email: TARGET_EMAIL,
            supabase_uid: authUser.id,
            name: TARGET_NAME,
            role: 'admin'
        }
    })

    console.log(`✅ Success! User ${dbUser.email} is ready.`)
    console.log(`Login: ${TARGET_EMAIL}`)
    console.log(`Password: ${PASSWORD}`)
}

main()
    .catch(console.error)
    .finally(() => {
        prisma.$disconnect()
    })
