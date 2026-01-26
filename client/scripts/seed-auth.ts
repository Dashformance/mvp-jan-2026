import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const prisma = new PrismaClient()

const USERS = [
    { name: 'João Vitor', email: 'joao@visualizen.com', role: 'admin' },
    { name: 'Nitz', email: 'nitz@visualizen.com', role: 'seller' },
    { name: 'Bruno', email: 'bruno@visualizen.com', role: 'seller' },
]

const PASSWORD = '@VISUALIZEN1'

async function main() {
    console.log('🌱 Seeding Users...')

    for (const u of USERS) {
        console.log(`Processing ${u.name}...`)

        // 1. Check if user exists in Supabase
        let { data: { users }, error } = await supabase.auth.admin.listUsers()
        let authUser = users?.find(user => user.email === u.email)

        if (!authUser) {
            console.log(`Creating Auth User: ${u.email}`)
            const { data, error: createError } = await supabase.auth.admin.createUser({
                email: u.email,
                password: PASSWORD,
                email_confirm: true,
                user_metadata: { name: u.name, role: u.role }
            })
            if (createError) {
                console.error(`Error creating auth user ${u.email}:`, createError)
                continue
            }
            authUser = data.user
        } else {
            console.log(`Auth User already exists: ${u.email}`)
            // Update password just in case
            await supabase.auth.admin.updateUserById(authUser.id, { password: PASSWORD })
        }

        if (!authUser) continue

        // 2. Sync with Prisma
        const dbUser = await prisma.user.upsert({
            where: { email: u.email },
            update: {
                supabase_uid: authUser.id,
                name: u.name,
                role: u.role,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
            },
            create: {
                email: u.email,
                name: u.name,
                role: u.role,
                supabase_uid: authUser.id,
                avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`
            }
        })
        console.log(`Synced DB User: ${dbUser.name} (${dbUser.id})`)
    }

    console.log('✅ Seeding complete!')
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
