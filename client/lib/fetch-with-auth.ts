/**
 * fetchWithAuth - Wrapper para fetch que lida com erros 401 automaticamente
 * Redireciona para login preservando a URL de retorno quando a sessão expira
 */
export async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
    const res = await fetch(url, options);

    if (res.status === 401) {
        // Sessão expirada - redirecionar para login preservando a URL atual
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        console.warn('⚠️ Sessão expirada, redirecionando para login...');
        window.location.href = `/login?returnUrl=${returnUrl}`;
        throw new Error('Session expired');
    }

    return res;
}

/**
 * Hook para usar fetchWithAuth com tratamento de erro integrado
 */
export function useFetchWithAuth() {
    return async <T = any>(url: string, options?: RequestInit): Promise<T> => {
        const res = await fetchWithAuth(url, options);

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || errorData.message || 'Request failed');
        }

        return res.json();
    };
}
