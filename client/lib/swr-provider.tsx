"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig
            value={{
                fetcher: (url: string) => fetch(url).then((res) => res.json()),
                revalidateOnFocus: true,
                revalidateOnReconnect: true,
                dedupingInterval: 5000,
                refreshInterval: 30000, // Sync with your analytics polling if needed
            }}
        >
            {children}
        </SWRConfig>
    );
}
