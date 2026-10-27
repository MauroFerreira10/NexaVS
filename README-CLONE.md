# NexaVS — site estático (raiz PT, espelho EN)

Rebranding de um espelho estático de `to-top.ch` (captado a 2026-10-23) para a
marca **NexaVS**, com a raiz traduzida para português europeu.

Backup do estado original antes das alterações:
`../to-top-adapted-backup-20261025.zip`.

## Como servir

Qualquer servidor estático com esta pasta como document root, porque os links
usam caminhos raiz-absolutos (`/lib/...`, `/images/...`):

```bash
npx serve -l 4173
# ou
python -m http.server 4173
# ou
npx http-server -p 4173
```

Abra `http://localhost:4173`.

> Não abra os `.html` por `file://` — a tag base e os paths `/...` exigem um
> servidor com esta pasta como document root.

## Rotas

- **PT (raiz):** `index.html`, `unser-ansatz.html`, `ihre-anliegen.html`,
  `begleitung.html`, `expertise-team.html`, `buch.html`, `medien.html`,
  `digitale-tools.html`, `download-newsletter.html`, `impressum.html`
  (`<html lang="pt">`)
- **EN:** espelho completo em `en/` (mesmas 10 páginas, `lang="en"`)
- O switcher de idioma usa `images/flags/pt.svg` (raiz) e `gb.svg` (EN).

## O que foi alterado

### Identidade

| Item | Antes | Depois |
|---|---|---|
| Logo header/footer/CTA/título | `totop-logo.svg`, `footer-logo.svg`, `to-top-cta-logo.avif`… | **SVG vetorial** (trace do wordmark): `nexavs-logo.svg` (navy/teal, fundos claros), `nexavs-logo-white.svg` (rodapé legal navy), `nexavs-logo-header.svg` (navbar: branco + `vs` teal); PNG `nexavs-logo*.png` mantidos como raster de fallback (693×120, mesmo intrinsic dos originais) |
| Paleta CSS | verde/ouro (`#0d352e`, `#28524d`, `#e5d5a3`, `#efb300`…) | navy/petrol NexaVS (`#003492`, `#003f9e`, `#bfe4ec`, `#0088a2`…) — 63 cores no `css/totop.webflow.css`, luminâncias preservadas |
| `:root` tokens | já estavam `#003492` / `#0088A2` | `--swatch--brandyellow` passou a estar definido (`#0088a2`) |
| Email | `info@to-top.ch` | `info@nexavs.com` |
| LinkedIn | `/company/to-top-ag/` | `/company/nexavs` |
| Booking Outlook | `outlook.office365.com/book/TOTOPAG@…` | `mailto:info@nexavs.com` |
| `data-wf-domain` | `www.to-top.ch` | `www.nexavs.com` |
| OG image | `Open-Graph-image-totop.jpg` | `Open-Graph-image-nexavs.png` (navy + wordmark branco, rasterizado do SVG a 1200×630) |
| Favicon/webclip | `favicon.png` | `favicon-nexavs.png` / `webclip-nexavs.png` — monograma **X** (`nexavs-mark.svg`) branco sobre gradiente navy, rasterizado a 64/180px |
| Switcher | DE (`flags/de.svg`) | PT (`flags/pt.svg`, criado) |
| `alt=` | "To-top …" | marca removida |

### Texto

- Raiz: 10 páginas traduzidas DE → PT-PT.
- EN: conteúdo em inglês mantido; limpos restos PT/DE em `og:title`, tagline do
  rodapé, `alt=` e `lang="de"` sobre conteúdo inglês.
- Nomes próprios, marcas de terceiros e URLs de âncora (`#strategieentwicklung`
  etc.) mantidos.

## Placeholder por confirmar

- **Domínio/email:** `www.nexavs.com` e `info@nexavs.com` usados como marcadores
  — trocar pelo domínio real quando existir (afeta HTML + `data-wf-domain`).
- **LinkedIn:** `linkedin.com/company/nexavs` é uma suposição.
- **OG image, favicon e logos:** gerados por vetorização do wordmark em `logo nexa/`;
  substituir se existir arte oficial (manter nomes de ficheiro).
- **Título do livro** `Das Design humaner Unternehmen`: alemão nas citações da
  obra (buch, índice, download, testeemunho) e traduzido nas menções temáticas
  (medien, digitale-tools) — espelha o comportamento do site EN.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `css/` | `normalize.css`, `webflow.css`, `totop.webflow.css` (design tokens + layout) |
| `js/` | `webflow.js` — runtime Webflow exportado (nav, sliders, interações IX2) |
| `lib/` | vendors originais do site via CDN: jQuery 3.5.1 (SRI intacto), GSAP 3.15.0 + 5 plugins, Lenis 0.2.28, spline-viewer 1.10.40, WebFont loader, Deftform embed |
| `images/` | assets + novos `nexavs-logo.svg` / `-white.svg` / `-header.svg`, `nexavs-mark.svg`, raster `nexavs-logo*.png`, `flags/pt.svg`, `Open-Graph-image-nexavs.png`, `favicon-nexavs.png`, `webclip-nexavs.png` |
| `fonts/` | Montserrat (9 pesos + itálicos) e BonVivantSerif locais |
| `documents/` | 6 PDFs originais (artigos, AGB) — conteúdo ainda do site antigo |
| `logo nexa/` | wordmarks-fonte da marca NexaVS |

## Dependências externas (iguais ao original)

- vídeos Vimeo embutidos via Embedly (Medien/equipe)
- formulário de newsletter (Deftform)
- Google Tag Manager (o script de instalação veio truncado no clone — inerte)

## Verificações finais (executadas)

- **Tradução:** as 10 páginas da raiz sem alemão visível (varredura de `äöüß`,
  títulos, `alt`, `aria-label`, `lang="de"` → 0 na raiz).
- **Glossário de navegação unificado** (inventário posicional 10/10):
  *Os seus desafios* · *Desenvolvimento de estratégia* · *Workshops & Formações* ·
  *Moderação & Grandes Grupos* · *Downloads & Newsletter* · *O livro* ·
  *Ferramentas digitais*. Corrigida a tradução sistemática de *Buch* →
  "Experiência" (passou a **livro**, nav + corpo).
- **Cores inline da raiz:** `#0e362f`, `#869a96`, `#547b5f`, `#fbf6f2` → 0;
  `alt="…To-Top…"` na raiz → 0.
- **Referências locais:** 2824 verificadas, **16 em falta — todas pré-existentes**
  (ver lacunas abaixo). Reparados nesta verificação: 8 candidatos `srcset` mortos
  (variantes 500w que o espelho nunca guardou) removidos + 2 hrefs de PDF do
  Handelsblatt reencaminhados para o ficheiro real em disco (mesmo artigo,
  nome "Kulturentwicklung").
- **Visual (servidor local, Edge headless):** header navy com logo branco/teal,
  nav PT unificada, hero/buch renderizados, paleta navy/petrol aplicada.

## Lacunas pré-existentes (não são do rebrand)

- `/lib/whatsapp-cta-embed.js` — referenciado por 6 páginas raiz + 6 en; o
  passo `totop_localify` do espelho nunca guardou este ficheiro. Sem script,
  os blocos CTA WhatsApp ficam vazios (comportamento original do clone).
- Fotos dos tiles de serviços Venture/Branding & Growth no índice —
  `images/Venture-mount_1.avif`, `images/Branding & Growth-mount_1.avif`
  (+ variantes hashed `67bbf277…` no en) nunca estiveram no espelho.
- Nomes duplicados/`mojibake` em `documents/` (pares NZZ/AGB) já vinham no original.

## Scripts de regeneração (raiz)

- `totop_mirror.mjs` — crawler que baixou HTML + assets
- `totop_localify.mjs` — localização dos bundles CDN + verificador
- `logo nexa/vectorize-nexavs.js` — vetorização do wordmark (Node;
  `npm i imagetracerjs pngjs`; regenera os SVGs, o monograma X e os templates
  HTML para rasterizar favicon/webclip/OG com Edge headless:
  `msedge --headless=new --screenshot=out.png --window-size=64,64 file:///…/_fav.html`)
