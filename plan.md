# sonic-stream-pay-v2 Plan

## Current Status
- Smart contract complete (11 tests passing)
- Frontend complete (Next.js 15, build success, hydration fixed)
- Testnet deployed: `0x172eD0a96b3366fA552cfDaD3318642Ef3432F02` (Chain 14601)
- Security review done (internal)
- Streams list: No real data display yet (events not fetched)

## Phases

### Phase 1: Smart Contract [COMPLETE]
- SonicStreamPay.sol (LlamaPay-based, 20-digit precision)
- MockERC20.sol for testing
- Hardhat config (Sonic Mainnet/Testnet)
- Deploy script
- 11-test suite (all passing)

### Phase 2: Frontend [COMPLETE]
- Next.js 15 + TypeScript + wagmi v2 + viem
- Dashboard, Create Stream, Active Streams pages
- Wallet connection (WalletConnect v2 + injected)
- useStreamPay + useTokenApproval hooks
- Hydration error fixes
- Build success

### Phase 3: Testnet Deployment [COMPLETE]
- Sonic Testnet deployment
- Test token deployed: `0x34179076D61091f003C024713B9c2fEcf164aeCB`
- Security review (internal)

### Phase 4: Feature Completion [PLANNED - HIGH PRIORITY]
- Stream list real data (StreamCreated event log fetching)
- Withdrawable amount real-time update
- Withdraw button implementation
- Cancel Stream button implementation

### Phase 5: UX Polish [PLANNED]
- Error handling (user-friendly messages)
- Transaction toast notifications
- Gas estimation display

### Phase 6: Production [PLANNED]
- Mainnet deployment
- External security audit
- Documentation
- FeeM registration

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-12-16 | 20-digit precision (1e20) | Prevents rounding errors on USDC/USDT (6 decimals) |
| 2025-12-16 | LlamaPay-based design | Proven efficient streaming payment architecture |
| 2025-12-16 | Protocol fee starts at 0% | Attract early users; can increase up to 1% |
| 2025-12-16 | Balance cap on withdrawals | Prevents over-payment if sender's deposit runs dry |
