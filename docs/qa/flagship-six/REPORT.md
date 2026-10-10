# Flagship Crew browser acceptance

Verified loopback preview at http://127.0.0.1:4191 with synthetic data, no paid providers or owner notification.

- Six cases: desktop 1440, mobile 390 and 360 pixels; dark and light themes.
- All six cards select their matching role and introduce the correct name.
- Each role responds to example and client customization prompts.
- Signed session retained across selections and handoff; sharing starts unchecked.
- Billing handoff with context opt-out clears prior text; no sentinel context leaked.
- Nonconcierge voice is hidden and callback remains disabled.
- Consultation CTA closes dialog, selects consultation interest, focuses name field.
- No horizontal document overflow, JavaScript errors, microphone access or provider requests.
- 48 screenshots plus machine-readable browser-results.json.

Playwright used the existing installed cache and Chrome. Final-build rerun uses one synthetic local IP per viewport/theme, with no per-role rate workaround. Prepared guidance has a bounded 24-chat/minute allowance; paid AI retains its separate stricter limit. All six cases passed.

Visual review: desktop light, mobile dark and 360-pixel light dialogs retain readable identity, role selection, message controls and consultation actions. Long transcript scrolls independently. At 360 pixels action text wraps but stays usable. Root addressed the roster heading grouping; the final build and all 48 refreshed screenshots include that fix. No remaining acceptance blockers.
