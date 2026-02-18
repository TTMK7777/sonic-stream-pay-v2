'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Dashboard() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sonic Stream Pay
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Real-time streaming payments powered by Sonic&apos;s sub-second finality.
            Pay salaries, subscriptions, and rewards by the second.
          </p>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Payments</h3>
              <p className="text-sm text-gray-500">Stream money by the second with Sonic&apos;s 0.7s finality</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Ultra-low Cost</h3>
              <p className="text-sm text-gray-500">$0.001 per transaction makes micropayments viable</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-sm text-gray-500">Built with OpenZeppelin contracts and security best practices</p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">💼</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">DAO Payroll</h4>
                  <p className="text-sm text-gray-500">Pay contributors in real-time, not monthly</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🎮</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">GameFi Rewards</h4>
                  <p className="text-sm text-gray-500">Stream rewards to players as they play</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">📺</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Content Subscriptions</h4>
                  <p className="text-sm text-gray-500">Pay only for what you watch or consume</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔐</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Token Vesting</h4>
                  <p className="text-sm text-gray-500">Distribute tokens gradually over time</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-500 mt-12">
            Connect your wallet to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <p className="text-sm text-green-100 mb-1">Total Streaming</p>
          <p className="text-3xl font-bold">$0.00</p>
          <p className="text-xs text-green-200 mt-2">per month</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Active Streams</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
          <p className="text-xs text-gray-400 mt-2">sending & receiving</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Withdrawable</p>
          <p className="text-3xl font-bold text-gray-900">$0.00</p>
          <p className="text-xs text-gray-400 mt-2">available now</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Stream
          </Link>
          <Link
            href="/streams"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View All Streams
          </Link>
        </div>
      </div>

      {/* Active Streams */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Streams</h2>
          <Link href="/streams" className="text-sm text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-gray-500">No active streams</p>
          <p className="text-sm text-gray-400 mt-1">
            Create your first stream to get started
          </p>
        </div>
      </div>
    </div>
  );
}
