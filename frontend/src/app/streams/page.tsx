'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';

type StreamFilter = 'all' | 'sending' | 'receiving';
type StreamStatus = 'active' | 'completed' | 'cancelled';

interface MockStream {
  id: string;
  sender: string;
  recipient: string;
  token: string;
  tokenSymbol: string;
  amountPerMonth: string;
  totalStreamed: string;
  withdrawable: string;
  status: StreamStatus;
  startTime: Date;
  endTime?: Date;
}

// Mock data for UI demonstration
const MOCK_STREAMS: MockStream[] = [];

export default function StreamsPage() {
  const { address, isConnected } = useAccount();
  const [filter, setFilter] = useState<StreamFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StreamStatus | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter streams based on current filter
  const filteredStreams = MOCK_STREAMS.filter(stream => {
    if (filter === 'sending' && stream.sender.toLowerCase() !== address?.toLowerCase()) return false;
    if (filter === 'receiving' && stream.recipient.toLowerCase() !== address?.toLowerCase()) return false;
    if (statusFilter !== 'all' && stream.status !== statusFilter) return false;
    return true;
  });

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Wallet</h2>
          <p className="text-gray-500 mb-4">Please connect your wallet to view your streams</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Streams</h1>
          <p className="text-gray-500 mt-1">Manage your payment streams</p>
        </div>
        <Link
          href="/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Stream
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Direction Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('sending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'sending'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sending
            </button>
            <button
              onClick={() => setFilter('receiving')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'receiving'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Receiving
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 ml-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StreamStatus | 'all')}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Streams List */}
      {filteredStreams.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Streams Found</h2>
          <p className="text-gray-500 mb-6">
            {filter === 'all'
              ? "You don't have any payment streams yet"
              : filter === 'sending'
              ? "You're not sending any streams"
              : "You're not receiving any streams"}
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Stream
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStreams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              currentAddress={address!}
            />
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Sending Streams</h3>
              <p className="text-sm text-gray-600">
                Streams you&apos;re paying to others. Make sure to keep enough balance to avoid stream interruption.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Receiving Streams</h3>
              <p className="text-sm text-gray-600">
                Streams being paid to you. Withdraw your accumulated tokens anytime with zero fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stream Card Component
function StreamCard({
  stream,
  currentAddress,
}: {
  stream: MockStream;
  currentAddress: string;
}) {
  const isSender = stream.sender.toLowerCase() === currentAddress.toLowerCase();
  const direction = isSender ? 'sending' : 'receiving';

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            direction === 'sending' ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {direction === 'sending' ? (
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {direction === 'sending' ? 'To' : 'From'}: {
                (direction === 'sending' ? stream.recipient : stream.sender).slice(0, 6)
              }...{
                (direction === 'sending' ? stream.recipient : stream.sender).slice(-4)
              }
            </p>
            <p className="text-sm text-gray-500">
              Started {stream.startTime.toLocaleDateString()}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[stream.status]}`}>
          {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Rate</p>
          <p className="font-semibold text-gray-900">{stream.amountPerMonth} {stream.tokenSymbol}/mo</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Streamed</p>
          <p className="font-semibold text-gray-900">{stream.totalStreamed} {stream.tokenSymbol}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            {direction === 'receiving' ? 'Withdrawable' : 'Remaining'}
          </p>
          <p className="font-semibold text-blue-600">{stream.withdrawable} {stream.tokenSymbol}</p>
        </div>
      </div>

      {/* Progress bar for active streams */}
      {stream.status === 'active' && (
        <div className="mb-4">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-1000"
              style={{ width: '35%' }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {direction === 'receiving' && stream.status === 'active' && (
          <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
            Withdraw
          </button>
        )}
        {direction === 'sending' && stream.status === 'active' && (
          <>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Top Up
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              Cancel
            </button>
          </>
        )}
        {stream.status !== 'active' && (
          <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-default">
            Stream {stream.status}
          </button>
        )}
      </div>
    </div>
  );
}
