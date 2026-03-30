# sonic-stream-pay-v2 Memory

## Failures and Lessons

### Hydration Errors (All Pages)
- **What happened**: Next.js 15 + React 19 server rendering produced HTML that differed from client hydration.
- **Root cause**: Wallet connection state (connected/disconnected) varies between server and client.
- **Fix**: Applied client-only rendering patterns for wallet-dependent components across all pages.
- **Lesson**: Always isolate wallet/blockchain state from server-side rendering in Next.js.

### Event Log Not Yet Fetched
- **What happened**: Streams page has layout but no real data.
- **Root cause**: StreamCreated events not being fetched from the blockchain.
- **Status**: Planned for Phase 4.
- **Lesson**: Plan event indexing early in the development timeline.

## Rejected Approaches

### Custom Token Implementation
- Considered building a custom token for the protocol.
- Rejected: Using existing ERC-20 tokens (wS, USDC, USDT) is more practical and has immediate utility.

### Off-Chain Payment Tracking
- Considered tracking payments off-chain with on-chain settlement.
- Rejected: Sonic's low fees make fully on-chain per-second payments economically viable.

## Feedback

### Internal Security Review (2025-12-16)
- All contract security checks passed (ReentrancyGuard, SafeERC20, overflow protection, access control, emergency pause, fee limit)
- Frontend: .env properly gitignored, React auto-escaping for XSS, input validation with isAddress()
- Noted: Test private key in contracts/.env is test-only; external audit needed before production
