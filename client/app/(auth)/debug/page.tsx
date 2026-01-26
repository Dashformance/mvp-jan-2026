"use client"

import { useEffect, useState } from "react"

export default function DebugEnvPage() {
    const [info, setInfo] = useState<any>({
        url: 'loading...',
        keyExists: 'loading...'
    })

    const [testResult, setTestResult] = useState<string>('')
    const [testLoading, setTestLoading] = useState(false)

    useEffect(() => {
        const envKeys = Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
        setInfo({
            url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
            keyExists: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES (Hidden)' : 'NO',
            availableKeys: envKeys.length > 0 ? envKeys.join(', ') : 'NONE'
        })
    }, [])

    const testConnection = async () => {
        setTestLoading(true)
        setTestResult('Testing...')
        try {
            const { createClient } = await import('@/lib/supabase/client')
            const sb = createClient()
            if (!sb) {
                setTestResult('FAIL: Supabase client returned null (Missing ENV)')
                return
            }

            setTestResult('Supabase client initialized. Testing reachability...')
            const { error } = await sb.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'wrong-password'
            })

            if (error?.message === 'Invalid login credentials') {
                setTestResult('✅ SUCCESS: Supabase is reachable and responding correctly (400 Invalid credentials as expected).')
            } else {
                setTestResult(`RESULT: ${error?.message || 'Unknown response'}`)
            }
        } catch (err: any) {
            setTestResult(`ERROR: ${err.message}`)
        } finally {
            setTestLoading(false)
        }
    }

    return (
        <div className="min-h-screen p-10 bg-black text-white font-mono">
            <h1 className="text-2xl mb-6 border-b border-accent pb-2">Dashformance Production Debug</h1>

            <div className="space-y-4 mb-10">
                <p>Project URL: <span className={info.url === 'NOT SET' ? 'text-red-500' : 'text-accent'}>{info.url}</span></p>
                <p>Anon Key Present: <span className={info.keyExists === 'NO' ? 'text-red-500' : 'text-accent'}>{info.keyExists}</span></p>
                <p className="text-xs text-text-muted">Keys Disponíveis: <span className="text-white">{info.availableKeys}</span></p>
            </div>

            <div className="p-6 border border-border-subtle rounded-xl bg-bg-elevated mb-10">
                <h2 className="text-lg mb-4 text-accent">Test Connectivity</h2>
                <button
                    onClick={testConnection}
                    disabled={testLoading}
                    className="bg-accent text-black px-4 py-2 rounded font-bold hover:bg-accent-light transition-colors disabled:opacity-50"
                >
                    {testLoading ? 'Processing...' : 'Test Connection Trace'}
                </button>
                <p className="mt-4 text-sm text-text-muted bg-black p-3 rounded border border-border-default min-h-[50px]">
                    {testResult}
                </p>
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10 text-sm">
                <p className="font-bold mb-1">⚠️ IMPORTANT:</p>
                <p>Se as informações acima estiverem erradas (como <b>NOT SET</b>), você deve:</p>
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                    <li>Adicionar as variáveis no painel do Vercel.</li>
                    <li><b>OBRIGATÓRIO:</b> Fazer um novo "Redeploy" no Vercel (aba Deployments).</li>
                    <li>Variáveis <i>NEXT_PUBLIC_</i> só funcionam se estiverem presentes no momento do <b>Build</b>.</li>
                </ol>
            </div>

            <a href="/login" className="mt-10 inline-block text-accent underline hover:text-accent-light">Ir para tela de Login</a>
        </div>
    )
}
