import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const DAO_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const DAO_ABI = [
  'function memberCount() view returns (uint256)',
  'function isMember(address) view returns (bool)',
  'function getUserBalance(address) view returns (uint256)',
  'function getTotalDeposited() view returns (uint256)',
  'event MemberRegistered(address indexed member, uint256 depositAmount)'
];

export async function GET() {
  try {
    if (!DAO_ADDRESS || !ethers.isAddress(DAO_ADDRESS)) {
      return NextResponse.json({ success: false, error: 'DAO_CONTRACT_ADDRESS no configurada' }, { status: 500 });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const daoContract = new ethers.Contract(DAO_ADDRESS, DAO_ABI, provider);

    let totalDepositedETH = 1;
    try {
      const totalDeposited = await daoContract.getTotalDeposited();
      totalDepositedETH = parseFloat(ethers.formatEther(totalDeposited)) || 1;
    } catch {
      totalDepositedETH = 1;
    }

    // Obtener eventos MemberRegistered desde el bloque 0
    const filter = daoContract.filters.MemberRegistered();
    const events = await daoContract.queryFilter(filter, 0, 'latest');

    const memberSet = new Set<string>();
    // Agregar Owner si está registrado o por defecto
    if (OWNER_ADDRESS && ethers.isAddress(OWNER_ADDRESS)) {
      const ownerIsMember = await daoContract.isMember(OWNER_ADDRESS);
      if (ownerIsMember) memberSet.add(OWNER_ADDRESS.toLowerCase());
    }

    for (const evt of events) {
      if ('args' in evt && evt.args && evt.args[0]) {
        memberSet.add((evt.args[0] as string).toLowerCase());
      }
    }

    const membersList = [];
    for (const addr of Array.from(memberSet)) {
      const checksumAddr = ethers.getAddress(addr);
      const isMem = await daoContract.isMember(checksumAddr);
      if (isMem) {
        const daoBalWei = await daoContract.getUserBalance(checksumAddr);
        const daoBalETH = parseFloat(ethers.formatEther(daoBalWei));

        let walletBalETH = '0.0000';
        try {
          const walletWei = await provider.getBalance(checksumAddr);
          walletBalETH = parseFloat(ethers.formatEther(walletWei)).toFixed(4);
        } catch {
          walletBalETH = '0.0000';
        }

        const participation = totalDepositedETH > 0 ? ((daoBalETH / totalDepositedETH) * 100).toFixed(2) : '0.00';

        membersList.push({
          address: checksumAddr,
          isOwner: checksumAddr.toLowerCase() === OWNER_ADDRESS.toLowerCase(),
          daoBalanceETH: daoBalETH.toFixed(4),
          walletBalanceETH: walletBalETH,
          participationPercentage: participation
        });
      }
    }

    return NextResponse.json({
      success: true,
      memberCount: membersList.length,
      totalDepositedETH: totalDepositedETH.toFixed(4),
      members: membersList
    });
  } catch (error: unknown) {
    console.error('Error al obtener lista de socios:', error);
    const msg = error instanceof Error ? error.message : 'Error al obtener socios';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
