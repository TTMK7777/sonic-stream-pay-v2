'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, type Address } from 'viem';
import { STREAM_PAY_ABI, CONTRACT_ADDRESSES, ERC20_ABI } from '@/lib/sonic/contracts';
import { sonicTestnet } from '@/lib/sonic/chain';

export interface Stream {
  sender: Address;
  recipient: Address;
  token: Address;
  amountPerSec: bigint;
  startTime: bigint;
  stopTime: bigint;
  withdrawn: bigint;
}

const PRECISION = BigInt(1e20);

// Hook for reading stream info
export function useStream(sender: Address | undefined, recipient: Address | undefined, token: Address | undefined) {
  const { chain } = useAccount();
  const contractAddress = CONTRACT_ADDRESSES[chain?.id || sonicTestnet.id] as Address;

  return useReadContract({
    address: contractAddress,
    abi: STREAM_PAY_ABI,
    functionName: 'getStream',
    args: sender && recipient && token ? [token, sender, recipient] : undefined,
    query: {
      enabled: !!sender && !!recipient && !!token,
    },
  });
}

// Hook for reading withdrawable amount
export function useWithdrawable(sender: Address | undefined, recipient: Address | undefined, token: Address | undefined) {
  const { chain } = useAccount();
  const contractAddress = CONTRACT_ADDRESSES[chain?.id || sonicTestnet.id] as Address;

  return useReadContract({
    address: contractAddress,
    abi: STREAM_PAY_ABI,
    functionName: 'withdrawable',
    args: sender && recipient && token ? [token, sender, recipient] : undefined,
    query: {
      enabled: !!sender && !!recipient && !!token,
    },
  });
}

// Hook for reading user's balance in contract
export function useContractBalance(token: Address | undefined, user: Address | undefined) {
  const { chain } = useAccount();
  const contractAddress = CONTRACT_ADDRESSES[chain?.id || sonicTestnet.id] as Address;

  return useReadContract({
    address: contractAddress,
    abi: STREAM_PAY_ABI,
    functionName: 'getBalance',
    args: token && user ? [token, user] : undefined,
    query: {
      enabled: !!token && !!user,
    },
  });
}

// Main hook for write operations
export function useStreamPay() {
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const contractAddress = CONTRACT_ADDRESSES[chain?.id || sonicTestnet.id] as Address;

  // Deposit tokens to contract
  const deposit = (token: Address, amount: string, decimals: number) => {
    const amountWei = parseUnits(amount, decimals);
    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'deposit',
      args: [token, amountWei],
    });
  };

  // Create stream
  const createStream = (
    recipient: Address,
    token: Address,
    amountPerSecond: string,
    decimals: number,
    duration?: number // in seconds, undefined = indefinite
  ) => {
    // Contract expects amountPerSec without PRECISION (it multiplies internally)
    const amountPerSec = parseUnits(amountPerSecond, decimals);
    const durationSeconds = duration ? BigInt(duration) : BigInt(0);

    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'createStream',
      args: [token, recipient, amountPerSec, durationSeconds],
    });
  };

  // Create stream with deposit (one transaction)
  const createStreamWithDeposit = (
    recipient: Address,
    token: Address,
    amountPerSecond: string,
    depositAmount: string,
    decimals: number,
    duration?: number
  ) => {
    // Contract expects amountPerSec without PRECISION (it multiplies internally)
    const amountPerSec = parseUnits(amountPerSecond, decimals);
    const depositWei = parseUnits(depositAmount, decimals);
    const durationSeconds = duration ? BigInt(duration) : BigInt(0);

    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'createStreamWithDeposit',
      args: [token, recipient, amountPerSec, durationSeconds, depositWei],
    });
  };

  // Withdraw from stream
  const withdraw = (sender: Address, token: Address, amount: string, decimals: number) => {
    // Contract expects amount with PRECISION (it divides internally to get actual amount)
    const amountWei = parseUnits(amount, decimals) * PRECISION;
    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'withdraw',
      args: [token, sender, amountWei],
    });
  };

  // Withdraw all available
  const withdrawAll = (sender: Address, token: Address) => {
    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'withdraw',
      args: [sender, token, BigInt(0)], // 0 = withdraw max
    });
  };

  // Cancel stream
  const cancelStream = (recipient: Address, token: Address) => {
    writeContract({
      address: contractAddress,
      abi: STREAM_PAY_ABI,
      functionName: 'cancelStream',
      args: [token, recipient],
    });
  };

  return {
    address,
    contractAddress,
    deposit,
    createStream,
    createStreamWithDeposit,
    withdraw,
    withdrawAll,
    cancelStream,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook for token approval
export function useTokenApproval(tokenAddress: Address | undefined, spenderAddress: Address | undefined) {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (amount: string, decimals: number) => {
    if (!tokenAddress || !spenderAddress) return;
    const amountWei = parseUnits(amount, decimals);
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, amountWei],
    });
  };

  const approveMax = () => {
    if (!tokenAddress || !spenderAddress) return;
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spenderAddress, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')],
    });
  };

  return {
    approve,
    approveMax,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Utility functions (not hooks)
export const streamUtils = {
  // Format amount from contract (with precision)
  formatAmount: (amount: bigint, decimals: number): string => {
    return formatUnits(amount / PRECISION, decimals);
  },

  // Calculate monthly amount from per-second rate
  calculateMonthlyAmount: (amountPerSec: bigint, decimals: number): string => {
    const monthly = (amountPerSec * BigInt(30 * 24 * 60 * 60)) / PRECISION;
    return formatUnits(monthly, decimals);
  },

  // Calculate per-second rate from monthly amount
  calculatePerSecondRate: (monthlyAmount: string, decimals: number): bigint => {
    const monthly = parseUnits(monthlyAmount, decimals);
    return (monthly * PRECISION) / BigInt(30 * 24 * 60 * 60);
  },

  PRECISION,
};
