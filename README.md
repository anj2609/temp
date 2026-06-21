# EMI Calculator

A Loan EMI calculator whose entire state (inputs, scenarios, prepayments, mode and theme)
syncs in **real time across every open browser tab** with no backend, no polling, and no `localStorage`
event hacks. Cross-tab transport is the browser-native `BroadcastChannel` API.

Built for the Frontend Intern assignment. Stack: **Next.js 14 (App Router) · React 18 · Zustand ·
BroadcastChannel · Tailwind CSS · Recharts · Geist**.

---

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

To see the headline feature, open the URL in **two or more tabs** and edit anything in one — the
others update instantly.

```bash
npm run build      # production build
npm test           # finance unit tests (Vitest)
```

---

## Features

### Core requirements

| # | Feature | Where |
|---|---------|-------|
| 1 | EMI calculator with synced slider + number inputs, live EMI / total interest / total payable and a principal-vs-interest split bar | `components/calculator`, `components/summary` |
| 2 | Month-by-month amortization schedule, paginated table (12/page), break-even row highlighted, table and stacked area chart toggle | `components/amortization` |
| 3 | Comparison mode, up to 3 scenarios side by side, lowest total payable highlighted | `components/compare` |
| 4 | What-if sensitivity heatmap, rate x tenure EMI grid with colour scale, clamped and de-duplicated near bounds, current cell highlighted | `components/sensitivity`, `hooks/useSensitivityGrid.ts` |
| 5 | Prepayment planner, schedule lump sums, see reduced tenure and interest saved (reduce-tenure strategy) | `components/prepayment` |
| 6 | **Cross-tab sync** of all shared state via `BroadcastChannel` | `lib/sync`, `store/syncMiddleware.ts` |
| 7 | Tab identity + live active-tab count via heartbeat presence | `lib/sync/tabIdentity.ts`, `hooks/useTabPresence.ts` |
| 8 | Theme sync, dark/light toggle propagates to all tabs (just another synced field) | `components/calculator/ThemeToggle.tsx` |

### Bonus challenges (all implemented)

- **Tab leadership / source of truth** - lowest-id leader election; a new tab requests current
  state from the leader on open, and a new leader is elected automatically when the leader closes.
  (`lib/sync/leaderElection.ts`, `lib/sync/index.ts`)
- **Undo across tabs** - `Ctrl/Cmd + Z` / `Ctrl + Shift + Z`; the rollback broadcasts so every tab
  reflects it. (`store/useEmiStore.ts`, history buttons in the header)
- **CSV export** - download the amortization schedule. (`components/amortization/ExportCsvButton.tsx`)
- **URL state** - calculator inputs and mode are encoded in the query string for shareable links.
  (`app/providers.tsx`)

### Extra features

- **Multiplayer ghost presence** - when another tab drags a slider you see a live ghost thumb +
  label in that tab's colour, and the header shows a pixel identicon avatar per open tab. Built on an
  ephemeral `FIELD_ACTIVITY` message that is throttled, never persisted, and never enters undo
  history, separate from the durable `STATE_UPDATE` path.
  (`lib/sync`, `hooks/useLiveActivity.ts`, `components/calculator/SyncedSliderInput.tsx`)
- **Reverse "solve for"** - flip the calculator to enter a monthly budget and solve for the loan
  amount or tenure you can afford. Exact algebra for principal; logarithm formula for tenure.
  (`lib/finance/solver.ts`, `components/calculator/InputPanel.tsx`)
- **Scan to continue on your phone** - the Share button renders a QR of the URL-encoded scenario
  so you can open it on mobile. (`components/share/ShareQr.tsx`)
- **Odometer digit-roll** - the headline Monthly EMI value animates each digit like a slot machine
  on change, with a green/red colour flash indicating whether EMI went down or up.
  (`components/ui/RollingNumber.tsx`)
- **EMI affordability gauge** - enter your monthly income to see whether the EMI is healthy,
  stretching, or risky relative to your budget. (`components/summary/AffordabilityGauge.tsx`)
- **Loan insights** - three auto-generated insights below the amortization schedule: interest cost
  as a share of principal, the month when 50% of principal is cleared, and how much the interest
  component drops from first to last EMI. (`hooks/useLoanInsights.ts`)
- **Sync change toasts** - when another tab changes a loan input, a toast appears with the tab's
  identicon and the field that changed. (`components/ui/Toaster.tsx`, `hooks/useToastStore.ts`)
- **Scroll sync** - scrolling in one tab mirrors to all other open tabs via a dedicated
  `BroadcastChannel`. (`hooks/useScrollSync.ts`)
- **Theme transition** - switching light/dark mode triggers a circular reveal animation that
  expands from the toggle button using the View Transitions API. (`components/calculator/ThemeToggle.tsx`)

---

## UI

Minimal design using **Geist** (self-hosted, no Google Fonts). Key choices:

- Soft off-white canvas (`#f6f3f4`), near-borderless white cards, `rounded-xl` radius.
- Single restrained accent (pastel green). Black for primary actions. Muted coral/green only for semantic deltas.
- Sliders: 4 px track, 16 px thumb, custom CSS fill with 60 ms ease-out transition.
- Toggle pills slide between options via a ref-measured `translateX` animation (220 ms cubic-bezier).
- Sensitivity grid is a real heatmap (sage to sand to dusty-rose lerp) with a gradient legend.
- Stacked area chart for amortization: principal fills from the bottom, interest sits above.
- Fully responsive: single-column on mobile, two-column at `lg` (1024 px).

---

## How cross-tab sync works

```
Tab A  --set action-->  Zustand store  --sync middleware (debounced)-->  BroadcastChannel
                                                                              |
                                                       postMessage('emi-sync-v1')
                                                                              v
Tab B  <--hydrateFromRemote--  Zustand store  <--onmessage (STATE_UPDATE)--  BroadcastChannel
```

- **One shared payload.** Every shared-state change broadcasts the whole shared slice as a single
  `STATE_UPDATE` message, not seven channels.
- **No echo loops.** `BroadcastChannel` never delivers to the sender; as defence-in-depth every
  message carries `sourceTabId` and is ignored if it equals this tab. Crucially, applying a remote
  message uses a different store action (`hydrateFromRemote`) than user intent
  (`setCalculatorInput`), so remote updates never re-broadcast.
- **Presence.** Each tab emits a `TAB_HEARTBEAT` every 2 s; a 3 s sweep drops any tab unseen for
  5 s. `TAB_BYE` on `pagehide`/`beforeunload` makes a normal close update the count in under a
  second, with the heartbeat timeout as the reliable fallback for crashes.
- **Persistence vs transport.** `localStorage` is used only to survive a full page reload
  (debounced write, hydrate before listeners attach), never as the cross-tab messaging mechanism.

Message protocol: `STATE_UPDATE`, `TAB_HELLO`, `TAB_HEARTBEAT`, `TAB_BYE`, `LEADER_REQUEST_STATE`,
and the ephemeral `FIELD_ACTIVITY` used only for live ghost cursors (`lib/sync/types.ts`).

---

## Architecture

```
app/          Next.js routes + the single client boundary (Providers)
components/   presentational + container UI (never touch BroadcastChannel)
hooks/        memoised derived state over the store + lib/finance
store/        Zustand store + sync/persist middleware
lib/finance/  pure math - no React, no window (unit-tested)
lib/sync/     cross-tab transport - no finance math
types/        shared domain types
```

- **`lib/finance/*` is pure** - every formula is `(inputs) -> result` with full floating-point
  precision throughout and a single rounding boundary at `format.ts`. Tested with Vitest, no
  DOM/React needed.
- **`lib/sync/*` knows nothing about loans** - it serialises a blob, sends it, hands back what
  arrives. It could be repointed at any shared-state shape unchanged.
- **SSR-safe by construction** - `BroadcastChannel`, `localStorage` and `crypto.randomUUID` are
  only ever touched inside `useEffect` in `app/providers.tsx`, so the server renders safe defaults
  with no hydration mismatch. A tiny inline script in `app/layout.tsx` applies the saved theme
  before paint to avoid a flash.

---

## Trying the features

| What | How |
|------|-----|
| Cross-tab sync | Open the same URL in two or more tabs; edit any slider |
| Leadership | Open 3 tabs; close the first one and a new leader is elected within one heartbeat |
| State hand-off | Open a fresh tab while others are open - it instantly mirrors the live workspace |
| Undo across tabs | Change amount in Tab A, press `Ctrl+Z` in Tab B - both revert |
| Ghost presence | Open two tabs side by side; drag a slider in one and watch the ghost thumb appear in the other |
| Scroll sync | Scroll in one tab and the other scrolls to the same position |
| URL state | Edit inputs, copy the URL, open it in a fresh incognito window |
| Solve for | In Single mode switch "Solve for" to Amount or Tenure, enter a monthly budget |
| QR share | Click Share and scan the code with your phone |
| Odometer | Watch the Monthly EMI digits roll and flash green/red as you move sliders |
| CSV export | In the Amortization panel click Export CSV |
| Theme transition | Click the moon/sun icon to see the circular reveal animation |

---

## Edge cases handled

Zero / out-of-range inputs (clamped at the store boundary; `rate = 0` uses the `P/n` limit),
extreme rates and tenures, prepayment larger than the balance (clamped - loan closes that month),
prepayment month beyond tenure (validated + filtered), multiple prepayments in one month (summed),
clamped/de-duplicated sensitivity axes near the bounds, and unclean tab closes (heartbeat timeout).
