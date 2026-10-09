# Crew callback source number plan

Prepared 2026-10-09. Status: review proposal only; no number provisioned, imported, or purchased. No phone call created. Existing readiness audit found zero owned source numbers.

## Browser voice cost evidence

Read-only voice metadata confirms Ellis reuses an ElevenLabs standard voice. With standard `gpt-4.1-mini`, no high-priority tier or paid add-ons, public component prices are $0.055/min voice infrastructure + $0.040/min ElevenLabs + $0.0128/min model = $0.1078/min; 120 seconds estimates $0.2156. Browser voice has no PSTN telephony charge. [Official pricing](https://www.retellai.com/pricing).

This is a base estimate, not a guaranteed worst-case dollar cap. Current billing documentation scales usage when total prompt context exceeds 4,000 tokens, including conversation transcript. A conservative full-cost scaling factor of 2 would estimate $0.4312 for two minutes, still within $0.50, but the provider exposes no quoted hard dollar stop for this call. The approved one-attempt allowance must not be described as a provider-enforced monetary ceiling. Keep the reviewed prompt and test conversation short, omit optional shared context, and reconcile actual call cost afterward. [Billing exceptions](https://docs.retellai.com/accounts/billing-exceptions).

## Concrete number proposal

Provision ONE US local, non-toll-free Retell-managed Twilio source number. Public recurring rental is $2/month while retained; usage charges are additional (public US telephony estimate $0.015/min). No SMS subscription, branded calling, verified-number add-on, or international calling is proposed. Confirm checkout/account charges before purchase; tax, proration and refund terms are not established by the public component table. [Official pricing](https://www.retellai.com/pricing).

Purchase contract: `POST https://api.retellai.com/create-phone-number`, with `country_code:"US"`, `number_provider:"twilio"`, `toll_free:false`, nickname `Crew private callback test`, US-only country lists, no inbound agent/webhook, and outbound binding only to reviewed published Ellis. Omit an exact number and area code for available US assignment. An optional US area code or exact E.164 number is supported, but no pre-purchase inventory/reservation endpoint was established in this audit; an exact available number is therefore not promised. [Create Phone Number](https://docs.retellai.com/api-references/create-phone-number).

## Required owner approval

Before purchase, obtain explicit approval for ONE assigned US local number at $2/month recurring plus separately bounded callback usage, with retention/release decision. This is separate from the already approved browser test. Before any callback obtain an exact private E.164 destination, confirmation the owner controls it and consents to the call, and a fresh finite callback attempt/budget/expiry grant. Keep callback disabled until source readback and destination verification. Full numbers and routing remain in ignored local configuration. No provision or configuration enablement occurred in this pricing review.
