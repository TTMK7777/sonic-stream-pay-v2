# Sonic Stream Pay - アーキテクチャ設計

## システム概要

```
┌─────────────────────────────────────────────────────────────┐
│                    Sonic Stream Pay                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Frontend   │  │   Smart     │  │   Sonic     │         │
│  │  (Next.js)  │──│  Contract   │──│  Blockchain │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## スマートコントラクト設計

### コアコントラクト: SonicStreamPay.sol

```solidity
// ストリーム構造体
struct Stream {
    address sender;      // 送信者
    address recipient;   // 受信者
    address token;       // ERC-20トークンアドレス
    uint256 deposit;     // デポジット額
    uint256 ratePerSec;  // 秒あたりレート（20桁精度）
    uint256 startTime;   // 開始時刻
    uint256 stopTime;    // 終了時刻（0=無期限）
    uint256 withdrawn;   // 引き出し済み額
    bool active;         // アクティブフラグ
}
```

### 主要関数

| 関数 | 説明 | ガス目安 |
|------|------|----------|
| `createStream()` | ストリーム作成 | ~70,000 |
| `withdraw()` | 資金引き出し | ~50,000 |
| `cancelStream()` | ストリームキャンセル | ~60,000 |
| `balanceOf()` | 残高確認（view） | 0 |
| `topUp()` | 追加入金 | ~40,000 |

### 精度管理（LlamaPay方式）

```
内部表現: 20桁（1e20）
理由: USDC（6桁）で月$1000送金時の精度エラー防止

計算例:
$1000/月 = 1000 * 1e6 / (30 * 24 * 60 * 60) = 385.8 USDC/秒
→ 精度不足で994/月になる問題を回避
```

## 対応トークン（MVP）

| トークン | アドレス | 小数点 |
|---------|---------|--------|
| wS | 0x039e2fB66102314Ce7b64Ce5Ce3E5183bc94aD38 | 18 |
| USDC | 0x29219dd400f2Bf60E5a23d13Be72B486D4038894 | 6 |
| USDT | 0x6047828dc181963ba44c82d2a5f290c36b3f4141 | 6 |

## フロントエンド構成

```
src/
├── app/
│   ├── page.tsx           # ダッシュボード
│   ├── create/page.tsx    # ストリーム作成
│   ├── streams/page.tsx   # ストリーム一覧
│   └── layout.tsx         # レイアウト
├── components/
│   ├── stream/
│   │   ├── CreateForm.tsx
│   │   ├── StreamCard.tsx
│   │   └── WithdrawButton.tsx
│   ├── dashboard/
│   │   ├── Summary.tsx
│   │   └── StreamList.tsx
│   └── wallet/
│       └── ConnectButton.tsx
├── hooks/
│   ├── useStreams.ts      # ストリームデータ取得
│   └── useStreamPay.ts    # コントラクト操作
└── lib/
    ├── contracts/
    │   └── StreamPay.ts   # ABI + アドレス
    └── sonic/
        └── chain.ts       # チェーン設定
```

## データフロー

### ストリーム作成
```
1. ユーザーがフォーム入力
2. ERC-20 approve() 実行
3. createStream() 実行
4. イベント監視 → UI更新
```

### 残高表示（リアルタイム）
```
1. balanceOf() で現在残高取得
2. ratePerSec から毎秒の増加量計算
3. setInterval で UI更新（1秒毎）
4. 実際の引き出しはユーザー操作時のみ
```

## セキュリティ考慮事項

1. **ReentrancyGuard** - 再入攻撃防止
2. **SafeERC20** - トークン操作の安全性
3. **Ownable** - 緊急停止機能
4. **精度検証** - オーバーフロー防止

## ガス最適化

1. **Singleton設計** - 全ストリームを1コントラクトで管理
2. **最小限のストレージ** - 必要なデータのみ保存
3. **View関数活用** - 計算はオフチェーンで実行
