import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '';
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS || '';
const DAO_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const OWNER_ADDRESS = process.env.NEXT_PUBLIC_OWNER_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    let relayerAddress = '';
    let relayerBalance = '0';
    let blockNumber = 0;

    if (RELAYER_PRIVATE_KEY) {
      const relayer = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
      relayerAddress = await relayer.getAddress();
      const balWei = await provider.getBalance(relayerAddress);
      relayerBalance = ethers.formatEther(balWei);
    }

    try {
      blockNumber = await provider.getBlockNumber();
    } catch {
      blockNumber = 0;
    }

    let forwarderDeployed = false;
    if (FORWARDER_ADDRESS) {
      const code = await provider.getCode(FORWARDER_ADDRESS);
      forwarderDeployed = code !== '0x';
    }

    let daoDeployed = false;
    if (DAO_ADDRESS) {
      const code = await provider.getCode(DAO_ADDRESS);
      daoDeployed = code !== '0x';
    }

    return NextResponse.json({
      success: true,
      ownerAddress: OWNER_ADDRESS,
      relayer: {
        address: relayerAddress,
        balanceETH: parseFloat(relayerBalance).toFixed(4),
        status: relayerAddress ? 'Activo' : 'No Configurado'
      },
      contracts: {
        daoAddress: DAO_ADDRESS,
        daoDeployed,
        forwarderAddress: FORWARDER_ADDRESS,
        forwarderDeployed
      },
      network: {
        rpcUrl: RPC_URL,
        chainId: 31337,
        blockNumber,
        status: blockNumber > 0 ? 'Conectado' : 'Sin Respuesta'
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error al consultar estado del sistema';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
