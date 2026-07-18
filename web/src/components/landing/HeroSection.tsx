'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950 -z-10" />

      {/* Animated blob elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 animate-pulse -z-10" style={{ animationDelay: '2s' }} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Main headline */}
        <div className={`space-y-6 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex justify-center gap-2 mb-4">
            
          </div>

          <h1 className="font-playfair font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 dark:from-blue-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            <span className="text-gray-900 text-[80px] dark:text-white">Descentralized</span>
            </span>
            <br />
            <span className="text-gray-900 text-[80px] dark:text-white">Governance</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Vote on proposals without paying gas. Our meta-transaction protocol enables secure, cost-free governance for your DAO.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-8 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '300ms' }}>
            <Link href="/dashboard">
              <button className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Enter DAO System
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <Link href="#features">
              <button className="inline-flex items-center justify-center px-8 py-6 text-lg rounded-lg font-semibold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Hero visual element */}
        <div className={`mt-16 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '600ms' }}>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 md:p-12 border border-gray-300 dark:border-gray-700 shadow-2xl backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">∞</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">No Gas Fees</div>
              </div>
              <div className="text-center border-l border-r border-gray-300 dark:border-gray-700">
                <div className="text-3xl md:text-4xl font-bold text-purple-600 dark:text-purple-400">🔐</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">Secure & Verified</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">⚡</div>
                <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-2">Instant Voting</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
