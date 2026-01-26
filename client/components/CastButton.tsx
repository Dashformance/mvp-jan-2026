
"use client";

import React, { useEffect, useState } from "react";
import { Cast } from "lucide-react";

declare global {
    interface Window {
        __onGCastApiAvailable: (isAvailable: boolean) => void;
        cast: any;
        chrome: any;
    }

    namespace JSX {
        interface IntrinsicElements {
            'is-google-cast-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

export function CastButton() {
    const [isApiAvailable, setIsApiAvailable] = useState(false);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        // Callback for when the Cast API is available
        window.__onGCastApiAvailable = (isAvailable) => {
            if (isAvailable) {
                setIsApiAvailable(true);
                initializeCastApi();
            }
        };

        // If script already loaded before component mount
        if (window.cast && window.cast.framework) {
            setIsApiAvailable(true);
            initializeCastApi();
        }
    }, []);

    const initializeCastApi = () => {
        try {
            const context = window.cast.framework.CastContext.getInstance();
            context.setOptions({
                receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
                autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            });

            context.addEventListener(
                window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
                (event: any) => {
                    const sessionState = event.sessionState;
                    if (sessionState === window.cast.framework.SessionState.SESSION_STARTED) {
                        setSession(context.getCurrentSession());
                    } else if (sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
                        setSession(null);
                    }
                }
            );
        } catch (e) {
            console.error("Cast API init error", e);
        }
    };

    const handleCastClick = () => {
        if (isApiAvailable && window.cast && window.cast.framework) {
            window.cast.framework.CastContext.getInstance().requestSession();
        } else {
            console.warn("Cast API not available");
        }
    };

    if (!isApiAvailable) return null;

    return (
        <button
            onClick={handleCastClick}
            className={`
        flex items-center justify-center p-2 rounded-full transition-all
        ${session
                    ? 'bg-accent text-bg-void shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'
                }
      `}
            title="Transmitir para TV"
        >
            {/* @ts-expect-error - Custom element not fully typed in JSX */}
            <is-google-cast-button style={{ width: '24px', height: '24px', display: 'block' }} />
            {/* We use the custom element provided by Google, but wrap it for styling or fallback to icon */}
            <Cast className="w-5 h-5" />
        </button>
    );
}
