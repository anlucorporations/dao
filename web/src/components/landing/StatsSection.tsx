'use client';

import { useEffect, useState } from 'react';

interface StatProps {
  label: string;
  value: string;
  suffix?: string;
  index: number;
}

function StatCard({ label, value, suffix = '', index }: StatProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`text-center transform transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
        {value}
        <span className="text-2xl md:text-3xl">{suffix}</span>
      </div>
      <p className="text-gray-600 dark:text-gray-400 text-lg">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const stats = [
    { label: 'Gas Savings Per Vote', value: '100', suffix: '%' },
    { label: 'Proposal Execution Time', value: '<1', suffix: 'min' },
    { label: 'Smart Contract Verified', value: '✓', suffix: '' },
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
