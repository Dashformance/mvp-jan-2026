export function AmbientGlow() {
    return (
        <>
            {/* Top glow (champagne) */}
            <div
                className="fixed top-[-300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-[-1]"
                style={{
                    background: '#DECCA8',
                    filter: 'blur(150px)',
                    opacity: 0.15,
                }}
            />

            {/* Bottom glow (cyan) */}
            <div
                className="fixed bottom-[-300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none z-[-1]"
                style={{
                    background: '#00D4FF',
                    filter: 'blur(150px)',
                    opacity: 0.1,
                }}
            />
        </>
    );
}
