'use client';

import React from 'react';
import ConfigCheck from '@/components/ConfigCheck';
import VotingCenter from '@/components/VotingCenter';

export default function VotingPage() {
  return (
    <ConfigCheck>
      <VotingCenter />
    </ConfigCheck>
  );
}
