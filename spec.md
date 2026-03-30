# sonic-stream-pay-v2 Specification

## Overview
Real-time streaming payment protocol on Sonic Blockchain. Enables continuous per-second ERC-20 token transfers. Senders deposit funds; the contract releases them to recipients over time. Based on LlamaPay's efficient design with 20-digit internal precision.

## Use Cases
- DAO / Web3 payroll -- real-time contributor payments
- GameFi rewards -- stream earnings as players complete actions
- Creator subscriptions -- pay only for time consumed
- DeFi integrations -- combine with lending/yield protocols

## Features

### Smart Contract (SonicStreamPay.sol)
| Function | Description |
|----------|-------------|
| `deposit()` | Deposit ERC-20 tokens to fund streams |
| `createStream()` | Create stream (requires prior deposit) |
| `createStreamWithDeposit()` | Deposit + create stream in one transaction |
| `withdraw()` | Recipient withdraws accrued balance (0 = max) |
| `cancelStream()` | Sender cancels stream, recovers unspent funds |
| `withdrawable()` | View: withdrawable amount for a recipient |

### Frontend
- Dashboard (hero + summary)
- Create Stream form (contract integration complete)
- Active Streams list and management
- Wallet connection (WalletConnect v2 + injected)

### Security
- `ReentrancyGuard` on all state-mutating functions
- `SafeERC20` for all token transfers
- `Ownable` for admin functions
- `Pausable` for emergency stop
- 20-digit internal precision prevents rounding loss
- Balance cap on withdrawals prevents over-payment
- Protocol fee: configurable basis-point (starts 0%, max 1%)

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Smart Contract | Solidity 0.8.20 + OpenZeppelin v5 |
| Contract Tooling | Hardhat + hardhat-toolbox + TypeChain |
| Frontend | Next.js 15 + React 19 |
| Blockchain Client | viem v2 + wagmi v2 |
| Wallet | WalletConnect v2 + injected wallets |
| Styling | Tailwind CSS |
| Language | TypeScript (strict) |

## Supported Tokens (Mainnet)

| Symbol | Address | Decimals |
|--------|---------|----------|
| wS (Wrapped Sonic) | `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38` | 18 |
| USDC | `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` | 6 |
| USDT | `0x6047828dc181963ba44c82d2a5f290c36b3f4141` | 6 |

## Deployed Contracts

| Network | Address |
|---------|---------|
| Sonic Testnet (14601) | `0x172eD0a96b3366fA552cfDaD3318642Ef3432F02` |
| Sonic Mainnet (146) | Not yet deployed |

## Non-Functional Requirements
- Sonic: 10,000 TPS, ~0.7s finality, ~$0.001/tx
- 20-digit precision (1e20) for low-decimal tokens
- All 11 contract tests must pass
- No formal security audit yet; required before mainnet production use
- Frontend must handle hydration correctly (React 19 SSR)

## Glossary

| Term | Definition |
|------|-----------|
| Streaming payment | Continuous per-second token transfer |
| amountPerSec | Rate of token transfer per second (in base units) |
| PRECISION | 1e20 internal multiplier for rounding prevention |
| LlamaPay | Reference implementation for streaming payments |
| FeeM | Sonic's fee monetization (90% gas rebate to dApps) |
| viem | TypeScript interface for Ethereum |
| wagmi | React hooks for Ethereum |
