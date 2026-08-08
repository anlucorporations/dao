'use client';

import React, { useEffect } from 'react';
import ConfigCheck from '@/components/ConfigCheck';
import ProposalManagement from '@/components/ProposalManagement';
import { startDaemon } from '@/lib/daemon';

export default function ProposalsPage() {
  useEffect(() => {
    startDaemon(60000);
  }, []);

  return (
    <ConfigCheck>
      <ProposalManagement initialTab="active" />
    </ConfigCheck>
  );
}
