# Modern Residential Portfolio — Realtor redesign review

Date: 2026-10-09. This supersedes the earlier architectural-journal implementation as the current realtor direction. The user rejected the prior cream/Georgia whole-page result and generic invitation; its closeout's premium judgment is historical, not evidence of owner acceptance.

## Direction and scope

Selected **modern cinematic residential portfolio**: bold refined sans hierarchy with selective serif accents; deep green, white and restrained light-green accents; immersive photographic sections balanced by compact functional UI. Unlike the previous hero-focused polish, this changes the entire realtor body:

- Full photographic hero with brand navigation, controlled dark gradients, large clear headline and a meaningful first inquiry.
- Compact buy / sell / explore intent dock. These open Crew with actual contextual questions; no pretend listing search.
- Three staggered photographic lifestyle cards with generated image provenance and no listing or geography claims.
- Alternating buyer and seller splits, distinct light/dark material treatments, priorities/timeline/next-step tags.
- Photographic local focus replacing the abstract LOCAL rectangle; verified service-area text only, no invented neighborhood facts.
- Reviewed service rows, concise three-step process and a dramatic Crew inquiry with quiet orbital linework.
- Responsive section stacks, visible controls and reduced-motion behavior. Additional original courtyard and neighborhood assets are generated concepts, not real listings.

The shared shell remains; only the realtor gets `estate-modern.css`. Niche-specific invitation text replaces blanket realtor language in cleaning and professional-service demos. Branding is configured from each prospect's name. No real voice/callback provider is connected.

## Invitation and useful conversation

Identity: Ellis / AI real-estate specialist.

Heading: **Your move. One conversation.**

Desktop invitation:
> Buying, selling, or just exploring? Give me the short version. I can explain Cedar Lane Realty’s services, help you choose a starting point, and prepare your next-step request for the team.

Mobile uses a concise equivalent, without truncating text:
> Buying or selling? Tell me your plan. I can explain the services and help prepare your next step for the team.

CTA: **Try Ellis — start with your move**. Two accessible one-click examples: **Where do I start buying?** and **How do I prepare to sell?** These explicitly chosen messages submit immediately and return grounded preparation guidance. Buyer guidance asks about preferred area, home type, timing and must-haves; seller consultation asks about property area, timing and process questions. Answers require the matching configured service and `answer_faq` permission. No valuation, active listing or appointment is asserted.

Small truth statement: **Chat works here · Voice and callback not connected**. In-panel interaction hierarchy remains Talk here → Call me → Chat, with voice intent clicks explanatory and no microphone or telephone access. Invitation remains delayed six seconds each document load and dismissed until refresh; no autoplay.

Opened realtor greeting:
> Hi, I’m Ellis, Cedar Lane Realty’s digital real estate specialist. Buying, selling, or just exploring? Tell me the short version. I can help you choose a starting point, explain the services, or prepare your next-step request for the team. Speaking is easier than typing a whole story: in a connected setup, choose Talk here and speak naturally. Talk here and Call me are planned, not connected in this concept. For now, choose Chat and I’ll help you here. Use fictional details in this private concept.

## QA artifacts and current review status

`docs/qa/modern-residential/` contains fullpage, hero/launcher, collection, buying, selling, local, services, process, inquiry, invitation and open-panel screenshots for desktop, mobile, small mobile and reduced-motion. Repeatable script: `node owner-ops/scripts/modern-residential-qa.cjs`. Test suite: `node --test owner-ops/tests/*.test.mjs` (10 tests).

The redesigned whole page is a materially stronger and more varied premium review candidate. Owner acceptance remains pending; do not describe it as satisfying the user's premium standard until reviewed. Private loopback-only behavior, review/hash gates, prepared chat, local draft handoffs, event contracts and disabled voice/callback constraints remain. Canonical preview server restarted after verifying its process identity; ignored workspaces/drafts preserved and all currently reviewed concepts regenerated. Live HTML and the existing Codex browser tab now show the current renderer. Director clicked the buying example in the actual tab and verified the grounded answer without pressing Send. State and Git delivery record the revision; owner visual judgment remains pending.

Final local QA: all 10 Node tests passed. Browser cases at 1440×1000, 390×844, 360×800 and reduced-motion desktop passed with zero browser errors. Actual one-click buyer example returns preparation guidance without pressing Send; seller intent dock populates context; text chat and local scheduling draft still work. All imagery loads, no horizontal overflow, invitation returns on refresh and stays dismissed until refresh, disabled voice intent/events remain truthful, no autoplay/microphone access, event payload exclusions and other niche routes/chat pass. Final screenshots use settled animations. The mobile invitation is approximately 307px high with reachable close and all actions visible.

## Asset provenance and preview repair

Two original assets generated with the built-in imagegen skill, optimized to WebP (1536×1024, quality 88): `estate-courtyard.webp` (500276 bytes) and `estate-neighborhood.webp` (648354 bytes). Courtyard prompt: editorial architectural photograph of a fictional contemporary limestone courtyard with indoor/outdoor living, olive tree and natural late-afternoon light; no signs, addresses, logos, people or listing claims. Neighborhood prompt: fictional tree-lined residential lane with mature oaks, gardens and homes; explicitly no named locality, verified neighborhood or identifiable landmark. No brokerage imagery copied. Existing generated exterior/interior assets retained. Built-in generation cost not separately itemized; no API key or paid voice session used.

The old long-running Node renderer held imported modules in memory while reading new CSS from disk. Regenerating through that process produced old invitation HTML. Restarting that verified local process and regenerating reviewed concepts fixes the mixed-version preview. Future renderer changes require restart + regeneration + actual live-tab verification.

Validated implementation: `d56ce9c2e99609904dcf5725b0ea3b5613de268a`. A separate checkpoint records this hash; final local/origin/fresh remote equality and clean tree verified after push. Query Git for current HEAD. No next milestone implementation begun.
