'use client';

import { useEffect, useState } from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon, title, description, index }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={`group p-6 md:p-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-500 transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } hover:shadow-lg dark:hover:shadow-blue-900/20`}
    >
      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-playfair text-xl md:text-2xl font-bold mb-3 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      icon: '⚡',
      title: 'Gasless Voting',
      description: 'Vote on proposals without paying gas fees. Our meta-transaction relayer handles the costs.',
    },
    {
      icon: '🔐',
      title: 'Cryptographically Secure',
      description: 'EIP-2771 compliant. Every transaction is signed and verified by the original voter.',
    },
    {
      icon: '🏛️',
      title: 'True Decentralization',
      description: 'Smart contract governance with transparent voting rules and automatic execution.',
    },
    {
      icon: '⏱️',
      title: 'Timed Proposals',
      description: 'Set custom voting deadlines. Approved proposals execute automatically after approval.',
    },
    {
      icon: '💰',
      title: 'Fund Management',
      description: 'Manage DAO treasury with precision. Allocate funds through transparent voting.',
    },
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Track proposal status, vote counts, and DAO statistics in real-time.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Governance Reimagined
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Cutting-edge technology meets decentralized principles. Experience the future of DAO governance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
