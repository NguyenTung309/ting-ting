# Design System: Tình Tính “Ting Ting” — Card Deck

## 1. Visual Theme & Atmosphere

The website is a bright, illustrated campaign about money and relationships. It should feel warm, candid, youthful, and hand-drawn, like a printed storybook translated into a clear digital experience. Existing Figma illustrations set the visual language: saturated pink characters, warm cream paper, yellow coin details, and deep navy outlines with a lightly grainy finish.

Keep the shared site header and footer around every public page. New experiences belong in the regular page flow and use the site's open, pale canvas; do not place them inside a separate dark app shell. Use a left-aligned editorial headline with an offset illustration area. Density 4/10, variance 6/10, motion 5/10.

## 2. Color Palette & Roles

- **Page White** (`#FFFFFF`) — default page canvas and open content areas.
- **Mist White** (`#F9FAFE`) — soft section background already used by the home page.
- **Ink** (`#171717`) — primary text and headings.
- **Ting Pink** (`#F85174`) — existing brand color for links, active navigation, headings, and the primary action.
- **Soft Pink** (`#FA6080`) — lighter brand surface and selected states.
- **Warm Cream** (`#FFF5E6`) — paper-like illustration and card surface.
- **Mint** (`#C9F4E8`) — occasional supportive illustration fill.
- **Navy Outline** (`#17114A`) — outline and shadow color contained within existing campaign artwork.
- **Muted Copy** (`#454545`) — body copy and supporting information.
- **Soft Border** (`#FFD6DF`) — quiet borders around cards and controls.

Pink is the only interface accent. Cream, mint, yellow, and navy can appear inside illustrations and paper-like compositions where they are already part of the campaign artwork. Keep the main page background light and avoid large black surfaces, neon glows, or unrelated color systems.

## 3. Typography Rules

- **All interface text:** CDA Independence Deck, loaded locally through `--font-cda-independence-deck` in the site layout. Use the same family for headings, descriptions, labels, question cards, and controls so Vietnamese glyphs stay consistent.
- **Fallback:** `sans-serif` only. Do not introduce Georgia, Times, another generic serif, or a font that is not bundled with the project.
- **Headlines:** weight-led hierarchy, restrained negative tracking, responsive `clamp()` sizing, and the existing pink/ink contrast.
- **Body:** 16px minimum when space allows, line-height 1.5–1.65, with copy kept near 65 characters per line.
- **Metadata:** use the same family at a smaller size; reserve mono only for technical values when needed.

### Done reference typography and shared chrome

Keep all 14 local CDA Independence Deck faces registered in the site layout: weights 300–900 in normal and italic styles. Shared navigation uses Medium 500 at 16px/22px, with a 30px active pill. Desktop footer body and credits use Regular 400 at 16px; only its headings use Bold 700. Mobile footer copy uses 12px/17px, email 12px/28px and phone 12px/18px. These explicit line heights reproduce the Done text boxes rather than relying on the browser's shorter `normal` metrics.

**Anaktoria exception:** the Done About slogan explicitly uses Anaktoria Regular at 24px. That font is not bundled. A licensed original font or a faithful vector export with accessible text is required in the About milestone; CDA is not an approved visual substitute for that slogan.

Shared chrome is owned by `app/globals.css`; the Home-only scene rules are in `app/home.css`, finance quiz rules in `app/figma-31.css`, and entry composition in `app/test-entry-figma.css`. Keep this import order in the site layout. Footer `is-home`/`is-standard` selects mobile composition (181px/237px at 393px); `is-embedded` controls placement only. Desktop footer is at least 344px and grows when narrow widths require credit wrapping. See `docs/design/css-ownership.md` for the migration evidence.

## 4. Card Page Concept

The Card page is a small reveal ritual inside the existing campaign site, not a separate application. Keep the same global header, footer, CDA Independence Deck font, light canvas, and hand-drawn campaign artwork.

- **Hero:** left-aligned campaign copy with the single primary action **“Mở bộ bài”**. On the right, a cream-and-pink 3D deck box sits among the campaign character, coin, flower, and loose paper-like accents.
- **Motion around the hero:** coins, flowers, and small marks float with slow, offset bobbing. Keep their travel short so they read as playful details, not loading indicators.
- **Closed state:** show the six-face 3D box responding to pointer position. Keep the card viewer hidden until the user chooses “Mở bộ bài.”
- **Open state:** hinge the top face back, let a few card backs burst out, then ease and dim the box while one branded card back rises into the center of the existing page stage.
- **Card reader:** show exactly one full-size card at a time. Give each face a layered paper edge, a small campaign masthead, a coin illustration, readable answer prompts, and a follow-up question. Swiping either direction sends the current card out with a small tilt and brings the next face in. Use discreet previous/next controls and a visual progress track.
- **Motion details:** retain the demo’s box hinge, rising deck/card, 3D flip, swipe exit, and twinkling star motions. Let the centered card and a few coin/flower accents hover gently together. Add a brief reflected highlight and a small tilt as each card flips. Translate its dark demo colors into the website’s white, cream, pink, mint, and navy palette.
- **Card examples:** use the conversation prompts and answer choices from the supplied demo. Keep the text on the front face concise, legible, and set in the website font.

## 5. Component Stylings

- **Primary action:** reuse the site's pink pill language (`.ttt-pill-link`): white text, rounded ends, and the existing directional arrow. Press feedback is a subtle downward transform.
- **Secondary action:** white or transparent fill with a fine pink outline and ink text.
- **Story cards:** use cream or white paper surfaces, soft pink borders, and small illustration details. Use shadow only when it clarifies depth.
- **Interactive 3D box:** build six faces from CSS 3D transforms. Use the project's pink, cream, and navy outline palette. Pointer position changes the box's tilt smoothly; when the pointer leaves, it eases back to its resting angle. Keep the box readable and visually stable. On touch devices, show its resting angle without adding drag instructions.
- **Illustration:** reuse the assets under `/figma-assets/design/`, especially the existing character, coin, and flower artwork. Preserve their intended aspect ratio and keep text in a separate readable zone.
- **Question card:** paper-like surface with one prompt, small topic label, answer suggestions, and a follow-up line. Keep the words readable and avoid quiz-like answer controls.

## 6. Layout Principles

- Preserve the shared site navigation and footer. Public pages render inside the existing `main` layout.
- Contain page content near 1200px and follow the spacing and responsive behavior used by neighboring public pages.
- For the Card page, use an asymmetric split hero: Vietnamese campaign copy and “Mở bộ bài” on the left; a bright, illustrated 3D box composition on the right. After opening, transition within this same page stage to one centered card at a time; keep the site header and footer visible.
- Use open whitespace, an offset rhythm, and existing illustrations instead of inventing a separate dark stage or app interface.
- Below 768px, stack the copy and box in one column and keep the box and single card within the viewport. Keep swipe targets usable and visible buttons at least 44px high.
- Prevent page-level horizontal overflow. Do not place copy over illustrations.

## 7. Motion & Interaction

- Let the box respond continuously to mouse or pen position over its illustration area, using clamped rotation and short ease-out transitions on `transform` only.
- Return the box to its resting angle when the pointer leaves the illustration area. On touch screens, retain the resting presentation.
- On “Mở bộ bài,” hinge the lid backward, release a few card shapes, recede the box, and bring one card to the center. Flip its back to the front, then let horizontal swipes send it out and reveal the next card.
- Let coins, flowers, and marks bob slowly with varied timing; stop these nonessential animations for `prefers-reduced-motion`.
- Use previous/next controls alongside swipe gestures. Keep the focused card reader on the same light campaign surface.
- Respect `prefers-reduced-motion` and remove nonessential transitions when requested.
- Do not display procedural steps, interaction instructions such as “drag to rotate,” or game-like progress badges on the Card page.

## 8. Anti-Patterns (Banned)

- Do not call the page “Card Online”; use **Card** in the navigation, title, and page metadata.
- Do not create a separate black/dark full-screen demo shell.
- Do not add “Bước 1,” step badges, drag instructions, or game HUD controls.
- Do not show multiple full question cards as a gallery or list. The reading state always focuses on one card.
- Do not add procedural steps, rotate/drag instructions, or a question-count / “many perspectives” / “no right or wrong” feature strip.
- Do not introduce a font that differs from the site's local CDA Independence Deck font.
- Do not use generic serif fonts, Inter, pure black, neon glows, or unrelated gradients.
- Do not replace the existing Figma campaign artwork with generic stock art.
- Do not place text over artwork or use a generic row of three equal feature cards.
- Do not use emoji or filler instructions such as “Scroll to explore.”
