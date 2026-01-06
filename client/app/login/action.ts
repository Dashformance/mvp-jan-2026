'use server'

import { cookies } from 'next/headers'

export async function submitLoginV6(formData: FormData) {
    const password = formData.get('password') as string;
    const ACCESS_KEY = "@@senhaVISUALIZEN123";
    const DEV_KEY = "1234";

    if (password === ACCESS_KEY || password === DEV_KEY) {
        const cookieStore = await cookies()

        cookieStore.set('dash_access', 'true', {
            path: '/',
            httpOnly: false, // Accessible by client if needed
            secure: false, // Safe for dev
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 24 hours
        })

        return { success: true }
    }

    return { error: 'Chave de acesso inválida' }
}
