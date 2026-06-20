# EMI Workspace — Shared Loan Calculator

A Loan EMI calculator whose entire state (inputs, scenarios, prepayments, mode and theme)
syncs in **real time across every open browser tab** — no backend, no polling, no `localStorage`
event hacks. Cross-tab transport is the browser-native `BroadcastChannel` API.

Built for the Frontend Intern assignment. Stack: **Next.js 14 (App Router) · React 18 · Zustand ·
BroadcastChannel · Tailwind CSS · Recharts**.

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
| 2 | Month-by-month amortization schedule — paginated table (12/page), break-even row highlighted, table ⇄ stacked-bar chart toggle | `components/amortization` |
| 3 | Comparison mode — up to 3 scenarios side by side, lowest total payable highlighted | `components/compare` |
| 4 | What-if sensitivity grid — rate × tenure EMI grid, clamped & de-duplicated near bounds, current cell highlighted, memoized | `components/sensitivity`, `hooks/useSensitivityGrid.ts` |
| 5 | Prepayment planner — schedule lump sums, see reduced tenure & interest saved (reduce-tenure strategy) | `components/prepayment` |
| 6 | **Cross-tab sync** of all shared state via `BroadcastChannel` | `lib/sync`, `store/syncMiddleware.ts` |
| 7 | Tab identity (`Tab #XXXXXX`) + live active-tab count via heartbeat presence | `lib/sync/tabIdentity.ts`, `hooks/useTabPresence.ts` |
| 8 | Theme sync — dark/light toggle propagates to all tabs (just another synced field) | `components/calculator/ThemeToggle.tsx` |

### Bonus challenges (all implemented)

- **Tab leadership / source of truth** — lowest-id leader election; a new tab requests current
  state from the leader on open, and a new leader is elected automatically when the leader closes.
  (`lib/sync/leaderElection.ts`, `lib/sync/index.ts`)
- **Undo across tabs** — `Ctrl/⌘ + Z` / `Ctrl + Shift + Z`; the rollback broadcasts so every tab
  reflects it. (`store/useEmiStore.ts`, history buttons in the header)
- **CSV export** — download the amortization schedule. (`components/amortization/ExportCsvButton.tsx`)
- **URL state** — calculator inputs and mode are encoded in the query string for shareable links.
  (`app/providers.tsx`)

---

## How cross-tab sync works

```
Tab A  ──set action──▶  Zustand store  ──sync middleware (debounced)──▶  BroadcastChannel
                                                                              │
                                                       postMessage('emi-sync-v1')
                                                                              ▼
Tab B  ◀─hydrateFromRemote─  Zustand store  ◀──onmessage (STATE_UPDATE)──  BroadcastChannel
```

- **One shared payload.** Every shared-state change broadcasts the whole shared slice as a single
  `STATE_UPDATE` message — not seven channels.
- **No echo loops.** `BroadcastChannel` never delivers to the sender; as defence-in-depth every
  message carries `sourceTabId` and is ignored if it equals this tab. Crucially, applying a remote
  message uses a **different store action** (`hydrateFromRemote`) than user intent
  (`setCalculatorInput`), so remote updates never re-broadcast.
- **Presence.** Each tab emits a `TAB_HEARTBEAT` every 2s; a 3s sweep drops any tab unseen for 5s.
  `TAB_BYE` on `pagehide`/`beforeunload` makes a normal close update the count in under a second,
  with the heartbeat timeout as the reliable fallback for crashes.
- **Persistence ≠ transport.** `localStorage` is used only to survive a full page reload
  (debounced write, hydrate before listeners attach) — never as the cross-tab messaging mechanism.

Message protocol: `STATE_UPDATE`, `TAB_HELLO`, `TAB_HEARTBEAT`, `TAB_BYE`, `LEADER_REQUEST_STATE`
(`lib/sync/types.ts`).

---

## Architecture

Strict one-directional layering keeps the math testable and the sync layer swappable:

```
app/         Next.js routes + the single client boundary (Providers)
components/   presentational + container UI (never touch BroadcastChannel)
hooks/        memoized derived state over the store + lib/finance
store/        Zustand store + sync/persist middleware
lib/finance/  PURE math — no React, no window (unit-tested)
lib/sync/     cross-tab transport — no finance math
types/        shared domain types
```

- **`lib/finance/*` is pure** — every formula is `(inputs) => result` with full floating-point
  precision throughout and a single rounding boundary at `format.ts`. This is why the worked
  examples reproduce to the rupee (EMI ₹38,768 for ₹15,00,000 @ 11% / 48mo). Tested with Vitest,
  no DOM/React needed.
- **`lib/sync/*` knows nothing about loans** — it serializes a blob, sends it, hands back what
  arrives. It could be repointed at any shared state shape unchanged.
- **SSR-safe by construction** — `BroadcastChannel`, `localStorage` and `crypto.randomUUID` are
  only ever touched inside `useEffect` in `app/providers.tsx`, so the server renders safe defaults
  and there is no hydration mismatch. A tiny inline script in `app/layout.tsx` applies the saved
  theme before paint to avoid a flash.

---

## Trying the bonus features

- **Leadership:** open 3 tabs; the one with the lowest id shows a `leader` badge. Close it — a new
  leader appears in another tab within a heartbeat. Open a 4th tab — it instantly mirrors the live
  workspace rather than starting from defaults.
- **Undo across tabs:** change the amount in Tab A, press `Ctrl+Z` in Tab B — both revert.
- **URL state:** edit inputs, copy the URL, open it in a fresh tab/window.

---

## Edge cases handled

Zero / out-of-range inputs (clamped at the store boundary; `rate = 0` uses the `P/n` limit),
extreme rates & tenures, prepayment larger than the balance (clamped, loan closes that month),
prepayment month beyond tenure (validated + filtered), multiple prepayments in one month (summed),
clamped/de-duplicated sensitivity axes near the bounds, and unclean tab closes (heartbeat timeout).
