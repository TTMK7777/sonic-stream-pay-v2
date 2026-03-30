# sonic-stream-pay-v2 - Spec-Driven Workflow

## Overview
Real-time streaming payment protocol on Sonic Blockchain.
Per-second ERC-20 token transfers with 20-digit precision.

## Workflow
1. `spec.md` -- What to build (requirements, constraints)
2. `plan.md` -- How to build it (phases, decisions)
3. `todo.md` -- Task tracking (status of each item)
4. `knowledge.md` -- Technical knowledge base
5. `memory.md` -- Lessons learned, failed approaches
6. `specs/` -- Detailed feature specifications

## Project Structure

| Path | Purpose |
|------|---------|
| `contracts/` | Hardhat project |
| `contracts/contracts/SonicStreamPay.sol` | Core streaming payment contract |
| `contracts/contracts/MockERC20.sol` | Test token |
| `contracts/scripts/deploy.ts` | Deployment script |
| `contracts/test/SonicStreamPay.test.ts` | Test suite (11 tests) |
| `frontend/` | Next.js application |
| `frontend/src/app/` | Dashboard, Create, Streams pages |
| `frontend/src/components/` | Header, Web3Provider, ConnectButton |
| `frontend/src/hooks/` | useStreamPay, useTokenApproval |
| `frontend/src/lib/sonic/` | Chain definitions, contract addresses/ABI |
| `frontend/src/lib/wagmi/` | wagmi client config |
| `docs/` | Architecture documentation |
| `PROGRESS.md` | Development progress tracking |

## Code Conventions
- **Solidity**: 0.8.20, OpenZeppelin v5, NatSpec, 20-digit precision (1e20)
- **TypeScript**: strict mode, Next.js 15 + React 19
- **Frontend**: wagmi v2 + viem v2, TailwindCSS
- Function naming: camelCase (Solidity & TypeScript)

## Run
```bash
# Contracts
cd contracts && npm install && npm test
cd contracts && npx hardhat node  # Local node

# Frontend
cd frontend && npm install && npm run dev  # -> http://localhost:3000
```

## Key Rules
- Never commit .env files (private keys, API keys)
- 20-digit precision (1e20) prevents rounding errors on USDC/USDT (6 decimals)
- Contract not audited -- use on mainnet at own risk
