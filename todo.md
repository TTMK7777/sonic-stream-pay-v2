# sonic-stream-pay-v2 TODO

## In Progress
(None currently)

## Not Started (High Priority)
- [ ] Stream list real data display (fetch StreamCreated event logs)
- [ ] Withdrawable amount real-time update on Streams page
- [ ] Withdraw button implementation (recipient token withdrawal)
- [ ] Cancel Stream button implementation (sender cancellation)

## Not Started (Medium Priority)
- [ ] Error handling UX (user-friendly messages)
- [ ] Transaction status toast notifications
- [ ] Gas estimate display
- [ ] Mainnet deployment
- [ ] External security audit
- [ ] FeeM registration

## Not Started (Low Priority)
- [ ] Documentation improvements
- [ ] Multi-token UI improvements
- [ ] Stream analytics dashboard

## Completed
- [x] SonicStreamPay.sol (deposit, createStream, withdraw, cancelStream)
- [x] createStreamWithDeposit (combined operation)
- [x] Protocol fee (0% start, max 1%)
- [x] Emergency pause (Pausable)
- [x] MockERC20.sol for testing
- [x] Hardhat config (Mainnet/Testnet/Localhost)
- [x] Deploy script
- [x] 11 test suite (all passing)
- [x] Frontend: Next.js 15 + React 19 + wagmi v2 + viem
- [x] Dashboard page (hero + summary)
- [x] Create Stream page (contract integration)
- [x] Streams page (layout)
- [x] Wallet connection (WalletConnect v2 + injected)
- [x] useStreamPay + useTokenApproval hooks
- [x] Hydration error fixes (all pages)
- [x] Sonic Testnet deployment
- [x] Internal security review
- [x] Build success

## On Hold
(None currently)
