---
name: testing-nabcex
description: Guide for testing the NabCex DeFi frontend application. Covers dev server setup, all page routes, dark/light mode, language toggle, responsive design, and known limitations.
---

# Testing NabCex Frontend

## Dev Server
```bash
npm run dev -- --host 0.0.0.0
# Runs on http://localhost:5173 (or next available port)
```

## Pages to Test (11 total)

### DeFi Pages
- `/` — Swap (default route)
- `/bridge` — Bridge
- `/pool` — Liquidity Pool
- `/staking` — Staking
- `/lending` — Lending & Borrowing
- `/farming` — Yield Farming
- `/launchpad` — Token Launchpad

### Analytics Pages
- `/dashboard` — Dashboard (real data from Blockscout API)
- `/history` — Transaction History (requires wallet)
- `/faucet` — Testnet Faucet (Circle faucet integration)
- `/admin` — Admin Panel (restricted to wallet 0xCCde4A0189384B5188470F15ED2CA83267D04b12)

## Key Features to Verify
- **Dark/Light mode**: Toggle via sun/moon icon in header
- **Language toggle**: Globe icon in header (English/Indonesian)
- **Responsive design**: Test at mobile width (~375px), sidebar should collapse
- **Glassmorphism**: Cards should have semi-transparent backgrounds with backdrop-blur
- **Admin access control**: Non-admin wallets see "Access Denied" screen

## Known Limitations
- No MetaMask in Devin test environment — cannot test wallet connection, token swaps, or blockchain transactions
- Blockscout API `/api/v2/transactions` does NOT support `?limit=N` parameter (returns 422)
- CoinGecko free tier may rate-limit price feeds under heavy use

## Build & Lint
```bash
npm run build  # TypeScript compilation + Vite build
npm run lint   # ESLint checks
```

## Pre-existing Lint Issues (not bugs)
- `no-empty` in WalletContext.tsx:137 (empty catch block)
- `react-refresh/only-export-components` warnings in context files
