# sonic-stream-pay-v2 Knowledge Base

## Technical Decisions

### 20-Digit Precision (1e20)
- Internal calculations use `amount * 1e20 / seconds` to prevent rounding
- Critical for low-decimal tokens like USDC (6 decimals) and USDT (6 decimals)
- Without this, per-second amounts would round to 0 for small streams

### LlamaPay Architecture
- Based on LlamaPay's proven streaming payment design
- Sender deposits -> contract releases to recipient over time
- Recipient withdraws accrued balance at any time
- Sender can cancel and recover unspent funds atomically

### Contract Security Layers
| Layer | Implementation |
|-------|---------------|
| Reentrancy | OpenZeppelin ReentrancyGuard |
| Token Safety | OpenZeppelin SafeERC20 |
| Access Control | OpenZeppelin Ownable |
| Emergency | OpenZeppelin Pausable |
| Overflow | Solidity 0.8.20 built-in |
| Fee Limit | `newFeeBps <= 100` (max 1%) |
| Balance Cap | Withdrawal limited to sender's actual deposit |

### Deployed Addresses
| Network | Contract | Address |
|---------|----------|---------|
| Testnet | SonicStreamPay | `0x172eD0a96b3366fA552cfDaD3318642Ef3432F02` |
| Testnet | TEST Token | `0x34179076D61091f003C024713B9c2fEcf164aeCB` |
| Testnet | Test Wallet | `0x42Ca67b4fa180F6d5a51e0B7ed573acCA9E41d39` |

### Mainnet Token Addresses
| Token | Address | Decimals |
|-------|---------|----------|
| wS | `0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38` | 18 |
| USDC | `0x29219dd400f2Bf60E5a23d13Be72B486D4038894` | 6 |
| USDT | `0x6047828dc181963ba44c82d2a5f290c36b3f4141` | 6 |

## Insights

### Sonic Network Performance
- 10,000+ TPS
- ~0.7 second finality
- ~$0.001 per transaction
- FeeM: 90% of gas fees returned to dApp operators

### Frontend Hydration (Next.js 15 + React 19)
- Server-rendered HTML must match client output
- Wallet state (connected/disconnected) causes hydration mismatch
- Fix: Use client-only rendering for wallet-dependent components

## External Resources
- Sonic Labs: https://soniclabs.com
- SonicScan: https://sonicscan.org
- Sonic Testnet: https://testnet.soniclabs.com
- LlamaPay (reference): https://llamapay.io
- OpenZeppelin v5 docs: https://docs.openzeppelin.com/contracts/5.x/

## FAQ

**Q: Why 1e20 precision?**
A: USDC has 6 decimals. Without scaling, per-second amounts for small streams would round to 0. 1e20 provides sufficient precision.

**Q: What happens if sender's deposit runs out?**
A: Balance cap prevents recipient from withdrawing more than the sender's remaining deposit. Stream effectively pauses.

**Q: Is the contract audited?**
A: Internal security review passed. No formal external audit yet -- required before mainnet production use.
