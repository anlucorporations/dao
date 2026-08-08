'use client';

import React from 'react';
import ConfigCheck from '@/components/ConfigCheck';
import ProposalManagement from '@/components/ProposalManagement';

export default function CreateProposalPage() {
  return (
    <ConfigCheck>
      <ProposalManagement initialTab="active" showCreateModalInitially={true} />
    </ConfigCheck>
  );
}
