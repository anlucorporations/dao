'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export function CTASection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 dark:from-blue-900 dark:via-purple-900 dark:to-blue-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className={`space-y-8 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white">
            Ready to Transform Your DAO?
          </h2>

          <p className="text-xl md:text-2xl text-blue-50 max-w-2xl mx-auto leading-relaxed">
            Join the revolution of cost-free, secure governance. Start participating in your DAO today without worrying about gas fees.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center pt-4 transform transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: '200ms' }}>
            <Link href="/dashboard">
              <button className="inline-flex items-center justify-center bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                Launch DAO System
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </Link>
            <a href="https://docs.soliditylang.org/en/latest/" target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center justify-center px-8 py-4 text-lg rounded-lg font-semibold border-2 border-white text-white hover:bg-white/10 transition-all">
                View Docs
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
