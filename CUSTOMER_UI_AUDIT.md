# Customer dashboard UI audit

Scope: the existing `wis12dom34/primeboostly` static preview and existing Vercel project. The repository README states that production Laravel/backend is separate. No production wallet, payment, order or auth integration is available here; the preview uses browser-local auth. Public `index.html`, admin screens, backend connections and payment handlers were not changed.

## Existing customer routes

| Area | Existing routes and states |
| --- | --- |
| Home and Nigeria ordering | `dashboard.html`: Home, new-order details, platform selection, entered details, review, pricing check, order preview |
| Catalogue | `services.html`, `services-search.html`, `global-search.html`; search results and empty search |
| Normal SMM | `normal-smm.html`: platform, services, order form, review, price, submitted preview; service limits and supplied-rate estimate |
| Orders | `orders.html`: all/processing/completed/failed/search; `order-detail.html` for Nigeria and Normal SMM; `order-history.html`; `refund-confirmation.html` |
| Wallet | `add-funds.html`: home/amount/amount-entered/method/selected/review/handoff/initiated; `profile-flow.html?view=wallet`, transactions/currency |
| Payments | `paystack-checkout.html`, `manual-deposit.html`, `payment-success.html`, `payment-failed.html` |
| Transactions | `transactions.html`, `fund-history.html`; local search/filter/empty results |
| Support | `support.html`, `support-flow.html` order/wallet/account/general; `new-ticket.html`, `ticket-detail.html` |
| Profile | `settings.html`, existing `profile.html` redirect; `profile-flow.html` account/wallet/transactions/currency/notifications/security; `account-edit.html` |
| Security | `security.html`, `security-flow.html` password/2fa/sessions/activity/verify/complete |
| Alerts and navigation | `notifications.html` all/orders/wallet/security; `mobile-menu.html`; `logout.html` confirm/signed-out |
| Authentication | `login.html`, `register.html`, `forgot-password.html`, `reset-password.html` |
| Feedback specimens | `system-states.html`: skeleton, empty with action, retry/error |

## Shared presentation

`customer-polish.css` reuses existing mobile component definitions and supplies one system for typography, green primary actions, cards, forms, status chips and safe-area navigation. `customer-polish.js` supplies one outline icon set, grouped navigation state, search/filter empty states and presentation-only estimates. Existing routing, auth handlers and data hooks are retained. Legacy desktop presentation is hidden on customer pages so the same screen is used at every viewport. Admin and public landing do not load either new file.

The balance-card white panel was the Add funds CTA; it now has explicit dark-green text and a usable label. Screenshot scaling, fixed 734px content heights, fake device status bars and nested clipping were replaced by ordinary document flow. Navigation reserves space and respects the bottom safe area. Inputs are at least 16px.

A pre-existing order-flow bug selected `body[data-selected-platform]` along with label spans and replaced the whole document with a platform name. The selector now targets spans only. Order screens work across desktop and mobile. Shared icon replacement is restricted to icon spans, preserving informational card copy. The obsolete resize handler was removed so resizing the viewport or opening a mobile keyboard does not reinitialize entered details. URL validity and integer quantity are checked in the preview UI; production validation remains authoritative.

## Verification

- 54 screen/query variants captured at 393×852 and checked at 320, 360, 375, 390, 393, 414, 430, 440, 768 and 1280px.
- Navigation regression: each visible bar stays fixed at the viewport bottom before and after document scrolling, with one visible bar, at least 44px link targets, and reserved content space across the same 10 viewport widths. The shared legacy positioning reset explicitly excludes navigation.
- No document horizontal overflow, right-edge overflow or visible inputs below 16px in the layout checks. No page JavaScript errors.
- Screenshots reviewed for major home, catalogue, form, order, wallet, transaction, support, profile, security, alert, auth and confirmation views. Desktop screenshots reviewed for Home, Services, Orders, Add funds, Support, Profile and Login.
- Local disposable-account journey: protected-route redirect; signup→login; incorrect password; successful login; Nigeria platform/details/review/price/preview/details; funding steps; transaction search/empty/reset; notification filters; service search; Normal SMM limits/estimate/review/preview; logout and protected-route redirect.
- `auth.js`, `paystack-checkout.js` and public `index.html` remained byte-for-byte unchanged. The existing preview ticket reply handler now renders replies in the visible mobile thread as well as the desktop thread.

Run the repeatable local flow test with Playwright installed:

```sh
node tests/customer-ui.cjs
node tests/customer-navigation.cjs
node tests/customer-buttons.cjs
```

Use `CHROMIUM_EXECUTABLE_PATH` for an existing Chromium binary. The test serves the repository on localhost:8081 and uses a disposable browser account; it sends no real orders or payments.

## Button follow-up

- Shared 48px button targets, 44px icon/filter/link targets, readable labels, consistent secondary/danger styles and disabled states. Small-screen Home actions retain 44px dimensions.
- Payment filter buttons no longer inherit status-chip dimensions. Clear filters restores both records and the active tab. Filter labels no longer wrap inside narrow fixed widths.
- Normal SMM Order tabs point to New Order. Header icon controls have accessible names. The hidden new-password field is visible and the Update password preview flow can continue. Password visibility uses outline eye icons and a 44px target; notification toggles are no longer nested inside links.
- Review CTAs use the shorter “Check price” label. Customer refund actions route to existing order support and order history rather than an admin screen. Manual payment submission is explicitly unavailable in the static preview, with an existing wallet-support entry point.
- The mobile support reply button now displays its local preview reply in the visible conversation.
- Button QA covers 56 screen/query variants at the 10 listed widths, accessible names, touch targets, customer destinations and horizontal overflow, plus filter reset, toggles, password visibility, order navigation, support reply and payment/refund help. Screenshots reviewed at 393×852.

## Limits

Chromium with iPhone-sized viewports was used, not physical iPhone Safari/WebKit. No live backend, wallet debit, payment callback, supplier purchase, real email delivery or production customer account was tested. Production integration and release to `primebooslty.com` require the separate Laravel source/deployment access. The Vercel release is the existing UI preview, not a production backend rollout.
