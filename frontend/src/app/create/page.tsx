'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { isAddress, parseUnits } from 'viem';
import Link from 'next/link';
import { SUPPORTED_TOKENS, STREAM_PAY_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from '@/lib/sonic/contracts';

type DurationUnit = 'hours' | 'days' | 'weeks' | 'months' | 'indefinite';

interface Token {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
}

export default function CreateStreamPage() {
  const { isConnected, chain, address } = useAccount();

  // Get tokens for current chain
  const tokens = useMemo((): Token[] => {
    if (chain?.id === 146) {
      return SUPPORTED_TOKENS.mainnet;
    }
    return SUPPORTED_TOKENS.testnet;
  }, [chain?.id]);

  const contractAddress = CONTRACT_ADDRESSES[chain?.id || 14601] as `0x${string}`;

  const [recipient, setRecipient] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token>(tokens[0] || SUPPORTED_TOKENS.mainnet[0]);
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('months');
  const [step, setStep] = useState<'approve' | 'create'>('approve');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selected token when chain changes
  useEffect(() => {
    if (tokens.length > 0 && !tokens.find(t => t.address === selectedToken.address)) {
      setSelectedToken(tokens[0]);
    }
  }, [tokens, selectedToken.address]);

  // Check allowance
  const { data: allowance } = useReadContract({
    address: selectedToken.address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && contractAddress ? [address, contractAddress] : undefined,
    query: { enabled: !!address && !!contractAddress },
  });

  // Approve transaction
  const { writeContract: writeApprove, data: approveHash, isPending: isApproving } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  // Create stream transaction
  const { writeContract: writeCreate, data: createHash, isPending: isCreating } = useWriteContract();
  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: createHash });

  // Update step based on allowance
  useEffect(() => {
    if (allowance && monthlyAmount) {
      const totalAmount = calculateTotalAmount();
      const totalNeeded = parseUnits(totalAmount === 'Unlimited' ? monthlyAmount : totalAmount, selectedToken.decimals);
      if (allowance >= totalNeeded) {
        setStep('create');
      } else {
        setStep('approve');
      }
    }
  }, [allowance, monthlyAmount, durationUnit, duration, selectedToken.decimals]);

  // Move to create step after approval success
  useEffect(() => {
    if (isApproveSuccess) {
      setStep('create');
    }
  }, [isApproveSuccess]);

  const isSubmitting = isApproving || isApproveConfirming || isCreating || isCreateConfirming;

  // Calculate per-second rate from monthly amount
  const calculatePerSecondRate = () => {
    if (!monthlyAmount) return '0';
    const monthly = parseFloat(monthlyAmount);
    const perSecond = monthly / (30 * 24 * 60 * 60);
    return perSecond.toFixed(18);
  };

  // Calculate total amount needed
  const calculateTotalAmount = () => {
    if (!monthlyAmount) return '0';
    if (durationUnit === 'indefinite') return 'Unlimited';

    const monthly = parseFloat(monthlyAmount);
    let durationInMonths = parseFloat(duration) || 0;

    switch (durationUnit) {
      case 'hours':
        durationInMonths = durationInMonths / (30 * 24);
        break;
      case 'days':
        durationInMonths = durationInMonths / 30;
        break;
      case 'weeks':
        durationInMonths = (durationInMonths * 7) / 30;
        break;
      case 'months':
        break;
    }

    return (monthly * durationInMonths).toFixed(4);
  };

  // Calculate duration in seconds
  const calculateDurationInSeconds = () => {
    if (durationUnit === 'indefinite') return 0;
    const value = parseFloat(duration) || 0;
    switch (durationUnit) {
      case 'hours': return value * 60 * 60;
      case 'days': return value * 24 * 60 * 60;
      case 'weeks': return value * 7 * 24 * 60 * 60;
      case 'months': return value * 30 * 24 * 60 * 60;
      default: return 0;
    }
  };

  const handleApprove = () => {
    const totalAmount = calculateTotalAmount();
    const amount = totalAmount === 'Unlimited' ? monthlyAmount : totalAmount;
    writeApprove({
      address: selectedToken.address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [contractAddress, parseUnits(amount, selectedToken.decimals)],
    });
  };

  const handleCreateStream = () => {
    const perSecondRate = parseFloat(monthlyAmount) / (30 * 24 * 60 * 60);
    const amountPerSec = parseUnits(perSecondRate.toFixed(18), selectedToken.decimals);
    const durationSec = BigInt(Math.floor(calculateDurationInSeconds()));
    const depositAmount = parseUnits(
      calculateTotalAmount() === 'Unlimited' ? monthlyAmount : calculateTotalAmount(),
      selectedToken.decimals
    );

    writeCreate({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'createStreamWithDeposit',
      args: [selectedToken.address, recipient as `0x${string}`, amountPerSec, durationSec, depositAmount],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(recipient)) {
      alert('Invalid recipient address');
      return;
    }

    if (step === 'approve') {
      handleApprove();
    } else {
      handleCreateStream();
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h2>
          <p className="text-gray-500 mb-4">Please connect your wallet to create a stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Payment Stream</h1>
        <p className="text-gray-500 mt-1">Set up continuous payments to any address</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          {recipient && !isAddress(recipient) && (
            <p className="text-red-500 text-sm mt-2">Invalid Ethereum address</p>
          )}
        </div>

        {/* Token & Amount */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token
              </label>
              <select
                value={selectedToken.address}
                onChange={(e) => {
                  const token = tokens.find(t => t.address === e.target.value);
                  if (token) setSelectedToken(token);
                }}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
              >
                {tokens.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {selectedToken.symbol}
                </span>
              </div>
            </div>
          </div>

          {monthlyAmount && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">
                Rate: <span className="font-mono text-gray-700">{calculatePerSecondRate()}</span> {selectedToken.symbol}/sec
              </p>
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stream Duration
          </label>
          <div className="flex gap-3">
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              min="0"
              disabled={durationUnit === 'indefinite'}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:text-gray-400"
            />
            <select
              value={durationUnit}
              onChange={(e) => setDurationUnit(e.target.value as DurationUnit)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="indefinite">Indefinite</option>
            </select>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {durationUnit === 'indefinite'
              ? 'Stream will continue until cancelled or funds depleted'
              : 'Stream will automatically stop after the duration'}
          </p>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4">Stream Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Recipient</span>
              <span className="font-mono text-gray-700">
                {recipient ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Token</span>
              <span className="text-gray-700">{selectedToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Rate</span>
              <span className="text-gray-700">{monthlyAmount || '0'} {selectedToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span className="text-gray-700">
                {durationUnit === 'indefinite' ? 'Indefinite' : `${duration || '0'} ${durationUnit}`}
              </span>
            </div>
            <div className="border-t border-blue-200 my-3"></div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-700">Total Required</span>
              <span className="text-blue-600">{calculateTotalAmount()} {selectedToken.symbol}</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {isCreateSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-green-800 mb-2">Stream Created Successfully!</h3>
            <p className="text-green-700 text-sm mb-4">
              Your payment stream to {recipient.slice(0, 6)}...{recipient.slice(-4)} has been created.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/streams"
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                View Streams
              </Link>
              <a
                href={`https://testnet.sonicscan.org/tx/${createHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white text-green-700 font-medium rounded-lg border border-green-300 hover:bg-green-50 transition-colors"
              >
                View on Explorer
              </a>
            </div>
          </div>
        )}

        {/* Actions */}
        {!isCreateSuccess && (
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !recipient || !monthlyAmount}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isApproving ? 'Approving...' :
               isApproveConfirming ? 'Confirming Approval...' :
               isCreating ? 'Creating Stream...' :
               isCreateConfirming ? 'Confirming...' :
               step === 'approve' ? `Approve ${selectedToken.symbol}` : 'Create Stream'}
            </button>
          </div>
        )}
      </form>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">How it works</p>
            <p>Once created, tokens will be streamed to the recipient every second. The recipient can withdraw accumulated tokens at any time. You can cancel the stream to stop payments and recover remaining funds.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
