# Design System: Liquid Glass + Champagne

Este documento define as diretrizes estéticas obrigatórias para o Dashformance.

## Cores Principais
- **Background Base**: `#181818` (Profundo, mas não preto puro)
- **Background Elevado**: `#222222` (Para cards e elementos flutuantes)
- **Accent (Champagne)**: `#DECCA8` (Usado para botões primários, ícones de destaque e estados ativos)
- **Texto Primário**: `#FFFFFF`
- **Texto Muted**: `#888888` ou `#DECCA8/50` (Transparência é chave)

## Estética "Liquid Glass"
1. **Glassmorphism**: Use `backdrop-blur-md` ou `backdrop-blur-lg` em modais e headers.
2. **Bordas**: Sempre sutis. Utilize `border border-white/10` ou `border border-accent/20`.
3. **Sombras de Neon**: Use `shadow-[0_0_20px_rgba(222,204,168,0.1)]` para o Champagne ou `rgba(34,197,94,0.1)` para o verde esmeralda.
4. **Gradientes**: Use de forma suave. Ex: `bg-linear-to-r from-accent/20 via-accent/10 to-transparent`.

## Tipografia
- Priorize fontes limpas (Inter, Roboto ou Outfit).
- Títulos de seção devem ter `tracking-wide` e `uppercase` quando em tamanho pequeno (ex: labels de colunas).

## Interação
- **Hovers**: Sempre aplique transições suaves (`transition-all duration-300`). O brilho e a escala (1.02) são bem-vindos para botões e cards de leads.
