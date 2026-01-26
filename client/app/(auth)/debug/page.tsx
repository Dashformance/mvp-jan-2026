"use client"

import { useEffect, useState } from "react"

export default function DebugEnvPage() {
    const [info, setInfo] = useState<any>({
        url: 'loading...',
        keyExists: 'loading...'
    })

    useEffect(() => {
        setInfo({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
            keyExists: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES (Hidden)' : 'NO'
        })
    }, [])

    return (
        <div className="p-10 bg-black text-white font-mono">
            <h1 className="text-xl mb-4">Debug Connection Info</h1>
            <p>Project URL: <span className="text-accent">{info.url}</span></p>
            <p>Anon Key Present: <span className="text-accent">{info.keyExists}</span></p>

            <div className="mt-8 p-4 border border-border-subtle rounded">
                <p className="text-xs text-text-muted mb-2">Se a URL acima não for "https://zegtywcyzjhmkqjgdpca.supabase.co", então o Vercel está configurado com outro projeto.</p>
                <p className="text-xs text-text-muted">Se a URL for "NOT SET", as variáveis de ambiente não foram adicionadas ao dashboard do Vercel.</p>
            </div>

            <a href="/login" className="mt-4 inline-block text-accent underline">Voltar para Login</a>
        </div>
    )
}
