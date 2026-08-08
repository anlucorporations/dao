'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/web3';
import {
  checkIsMember,
  getDAOBalance,
  getUserBalance,
  getMemberCount,
  getProposalCount,
  getProposal
} from '@/lib/daoHelpers';
import ConfigCheck from '@/components/ConfigCheck';
import DAOFinancialOverview from '@/components/DAOFinancialOverview';
import MemberFinancialOverview from '@/components/MemberFinancialOverview';

export default function TreasuryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isMember, setIsMember] = useState<boolean>(false);
  const [userBalanceETH, setUserBalanceETH] = useState<string>('0');
  const [totalTreasuryBalance, setTotalTreasuryBalance] = useState<string>('0');
  const [totalIngresos, setTotalIngresos] = useState<string>('0');
  const [totalEgresos, setTotalEgresos] = useState<string>('0');
  const [gasSavedETH, setGasSavedETH] = useState<string>('0');
  const [memberCount, setMemberCount] = useState<number>(0);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  useEffect(() => {
    async function loadTreasuryFinancials() {
      try {
        setLoading(true);
        const provider = getProvider();
        const signer = await getSigner();

        let currentAddr: string | null = null;
        if (signer) {
          currentAddr = await signer.getAddress();
          setAccount(currentAddr);
        } else {
          setAccount(null);
        }

        if (provider) {
          // 1. Balance de la Tesorería de la DAO
          const daoBal = await getDAOBalance(provider);
          const daoBalETH = ethers.formatEther(daoBal);
          setTotalTreasuryBalance(daoBalETH);

          // 2. Conteo de socios
          const mCount = await getMemberCount(provider);
          const memberNum = Number(mCount);
          setMemberCount(memberNum);

          // 3. Balance de Ingresos acumulados (mínimo 3 ETH por socio)
          const minIngresos = BigInt(memberNum) * ethers.parseEther('3');
          setTotalIngresos(ethers.formatEther(minIngresos));

          // 4. Datos del socio conectado
          if (currentAddr) {
            const memberStatus = await checkIsMember(provider, currentAddr);
            setIsMember(memberStatus);

            const userBal = await getUserBalance(provider, currentAddr);
            setUserBalanceETH(ethers.formatEther(userBal));
          } else {
            setIsMember(false);
            setUserBalanceETH('0');
          }

          // 5. Conteo de propuestas y cálculo de egresos ejecutados
          const pCount = await getProposalCount(provider);
          const pCountNum = Number(pCount);
          setProposalCount(pCountNum);

          let egresosWei = BigInt(0);
          for (let i = 1; i <= pCountNum; i++) {
            const p = await getProposal(provider, i);
            const amount = BigInt(p[3]);
            const executed = p[6];
            if (executed) {
              egresosWei += amount;
            }
          }
          setTotalEgresos(ethers.formatEther(egresosWei));

          // 6. Estimación de gas cancelado / ahorrado (~0.003 ETH por meta-tx)
          const estimatedGasSaved = (pCountNum * 0.003).toFixed(4);
          setGasSavedETH(estimatedGasSaved);
        }
      } catch (err) {
        console.error('Error al cargar datos financieros de tesorería:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTreasuryFinancials();
  }, [refreshTrigger]);

  const handleBalanceUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <ConfigCheck>
      <div className="space-y-8">
        {/* Header Section with Certified Member Badge Icon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white">💰 Tesorería</h1>
            
            {/* Icono de Usuario Inscrito y Certificado */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold shadow-lg shadow-emerald-500/10 cursor-default shrink-0">
              <span className="text-sm">🛡️</span>
              <span>Usuario Certificado</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm">
            Información financiera exclusiva de la DAO y de la billetera del socio.
          </p>
        </div>

        {/* Financial Components Container */}
        <div className="space-y-8">
          {/* Componente 1: Finanzas Generales de la DAO */}
          <DAOFinancialOverview
            totalTreasuryBalance={totalTreasuryBalance}
            totalIngresos={totalIngresos}
            totalEgresos={totalEgresos}
            gasSavedETH={gasSavedETH}
            memberCount={memberCount}
            proposalCount={proposalCount}
            loading={loading}
          />

          {/* Componente 2: Finanzas del Socio Conectado */}
          <MemberFinancialOverview
            account={account}
            isMember={isMember}
            userBalanceETH={userBalanceETH}
            totalDAOBalanceETH={totalTreasuryBalance}
            onBalanceUpdated={handleBalanceUpdated}
            loading={loading}
          />
        </div>
      </div>
    </ConfigCheck>
  );
}
