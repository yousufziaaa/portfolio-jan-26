# Portfolio rebuild: Instrument + Handbook

Status: **Phase 0 prototype in progress** on the `os-rebuild` branch. `main` stays live.

History: this started as a "personal OS" with windows, a dock and a menu bar. On 2026-11-11 we dropped the window manager in favor of a hybrid of two forms: the **Instrument** and the **Handbook**. Later the same day, after reviewing the first prototype, we also dropped the dither sky, the flat spiral, the live readouts and the meters. The direction is now **minimal and clean**: one quiet 3D text funnel behind plain typography.

## 1. Concept

- **The landing.** A dim 3D funnel of text (rings sliding at their own speeds, one word lit as it crosses 12 o'clock) sits behind a short statement and a list of selected work. The person is not the centrepiece: the vanishing point sits off to the side, and the name is a small label.
- **The Handbook (reading).** Opening a project turns it into a chapter of a printed book: a chapter opener with big type, an index, an editorial layout, and images that resolve out of a dither. About, Notes (writing), Gallery (playground) and Changelog are further chapters or appendices of the same book.

Ground rules:
- **Every chapter has a real URL** and is server-rendered. The existing URLs (`/projects/[slug]`, `/writing`, `/playground`, `/changelog`) keep working.
- **Reach a case study in one click** from the landing.
- **The system dresses the content; it doesn't gatekeep it.** No boot screen blocks a deep link.
- **It's original.** It doesn't imitate any existing product.

## 2. Visual system

| Reference | Used for |
|---|---|
| Wallet app, rotating rings | **Signature element.** Rings of text in perspective, and the word passing 12 o'clock lights up in the accent color. |
| stripe.press/scaling | **The funnel.** Text rows on a flared 3D surface, each sliding at a hashed speed. |
| Forge legal AI | **Labels.** Uppercase mono with wide tracking, text set around the edges of a block, a pixel-grid mark. |
| PCB blueprint | **Second texture.** Hairline traces and component labels, used for diagrams inside chapters and possibly an alternate sky. |
| Resend handbook | **Handbook layout.** Spreads, chapter openers, an index, generous margins. |
| Devouring Details: Mantras | **Physical objects.** An optional 3D card deck for browsing chapters. |

- **Themes:** Night (default, near-black) and Day (cream paper, around `#F3F1EA`).
- **Accent:** one per theme, used only for the read head, focus, selection and live data. Green vs. blue is still open.
- **Type:** undecided. The prototype uses Neue Machina for nearly everything and Departure Mono only for tiny labels. Heavy monospace is out.
- **Restraint:** the funnel stays dim so the copy and work are in focus. No panels, meters or live counters on the landing.
- **Motion:** ease-out for UI. `prefers-reduced-motion` freezes the funnel.

## 3. Shaders

1. **Text funnel** (`components/system/TextTunnel.tsx`, three.js): rows of text on the inside of a flared funnel. There's one texture row per ring, filled with whole words to fit its circumference, and the word centres are baked into the texture so whole words light up. Drag spins it, the camera drifts with the cursor, and it pauses when the tab is hidden.
2. **Image reveal** for chapter images (optional, later).

## 4. Pages

| Page | Form | Replaces |
|---|---|---|
| `/` | Instrument | Hero, Projects list, About teaser, footer |
| `/projects/[slug]` | Handbook chapter | Current case-study pages |
| `/about` | Handbook chapter (new route) | About section |
| `/writing`, `/writing/[slug]` | Handbook appendix | Writing |
| `/playground` | Handbook plates (gallery) | Playground |
| `/changelog` | Handbook colophon | Changelog |
| `/404` | Funnel with "lost" in other languages | — |

## 5. Landing: contents

- **Header:** the name on the left; Resume, Email, LinkedIn, X and Research on the right.
- **Statement (bottom left):** "Product designer and engineer, currently at Latent." Then one line on Nvidia, Groq (the GroqCloud design system), Phia, Klarify and Waterloo.
- **Selected work (bottom right):** a hairline list of title and dates, linking to each chapter.
- **Behind:** the dim text funnel.
- **Mobile:** one column, with a fade behind the copy so it stays readable over the funnel.

## 6. Architecture

- Next.js App Router, TypeScript, Tailwind and Framer Motion as now, plus three.js for the funnel.
- `components/system/`: `TextTunnel`, `Instrument` (landing). `ShaderSky` and `SpiralText` are retired prototypes, kept until we're sure.
- `components/handbook/`: `ChapterOpener`, `Spread`, `Index`, `DitherImage`.
- `styles/tokens.css`: color, type, spacing and motion tokens for both themes.
- Content stays in `data/projects.ts` and `app/writing/posts/*.md`.

## 7. Phases

| Phase | Output | Shippable? |
|---|---|---|
| **0. Prototype** | Real Instrument landing: shader sky, spiral, readouts, processes. Reviewed in the browser. | No |
| **1. System** | Tokens, both themes, components finished and accessible, mobile reflow | No |
| **2. Handbook** | Chapter template, then all 5 case studies ported; dither image reveal | **Yes: cutover** |
| **3. Appendices** | About, Notes, Plates, Colophon, 404 | Yes |
| **4. Polish** | Dither-dissolve transitions, motion review (Emil's skills), interface and accessibility review (Jakub's skills), Lighthouse, per-chapter OG images | Yes |

## 8. Cleanup that comes with it

- Delete unused components: `ScrollTimeline`, `Contact`, `Skills`, `media-between-text`, and the two `underline-*-in-*-out` variants. Retire `ClockNav`, `SocialLinksGravity` and the old `Hero`/`About`/`Projects` once they're replaced.
- Use pnpm only and drop `package-lock.json`. Drop `.replit` if Netlify is the only host.
- Keep one resume path and remove `/api/resume`.
- Rewrite the metadata description and README.

## 9. Open decisions

1. Accent: signal green or electric blue.
2. The display serif for chapter openers.
3. What the spiral rings say. The current default is languages, roles and projects.
4. Whether Bronco AI and Modulize (currently hidden) come back as chapters.
5. Whether the 3D card deck appears anywhere, for example as an index view.
