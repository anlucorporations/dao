import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || '';
const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

const FORWARDER_ABI = [
  'function execute((address from,address to,uint256 value,uint256 gas,uint256 nonce,bytes data) req, bytes signature) payable',
  'function getNonce(address from) view returns (uint256)'
];

const userLocks = new Set<string>();

export async function POST(request: NextRequest) {
  let userAddress: string | null = null;
  
  try {
    const body = await request.json();
    const { request: forwardRequest, signature } = body;

    if (!forwardRequest || !signature || !forwardRequest.from) {
      return NextResponse.json(
        { error: 'Petición o firma faltante' },
        { status: 400 }
      );
    }

    userAddress = forwardRequest.from.toLowerCase() as string;
   
    if (userLocks.has(userAddress)) {
      return NextResponse.json(
        { error: 'El usuario ya tiene una transacción en progreso' },
        { status: 429 }
      );
    }
    userLocks.add(userAddress);

    if (!RELAYER_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'RELAYER_PRIVATE_KEY no está configurada' },
        { status: 500 }
      );
    }

    if (!FORWARDER_ADDRESS) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS no está configurada' },
        { status: 500 }
      );
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const relayer = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
    const forwarder = new ethers.Contract(FORWARDER_ADDRESS, FORWARDER_ABI, relayer);

    const currentNonce = await forwarder.getNonce(forwardRequest.from);
    const requestedNonce = BigInt(forwardRequest.nonce);

    if (requestedNonce !== currentNonce) {
      console.error('Mismatch de Nonce! Esperado:', currentNonce.toString(), 'Recibido:', forwardRequest.nonce);
      return NextResponse.json(
        { error: 'Nonce desactualizado', expected: currentNonce.toString(), received: forwardRequest.nonce },
        { status: 400 }
      );
    }

    // Estimar gas y enviar transacción
    try {
      await forwarder.execute.estimateGas(forwardRequest, signature);
    } catch (gasError) {
      console.error('Falló la estimación de gas:', gasError);
    }

    const tx = await forwarder.execute(forwardRequest, signature, {
      gasLimit: 3000000
    });

    const receipt = await tx.wait();

    if (userAddress) {
      userLocks.delete(userAddress);
    }

    return NextResponse.json({
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error: unknown) {
    console.error('Error al procesar la meta-transacción:', error);

    if (userAddress) {
      userLocks.delete(userAddress);
    }

    let detailMessage = 'Error al enviar la transacción al relayer';
    if (error && typeof error === 'object') {
      if ('reason' in error && typeof (error as { reason: string }).reason === 'string') {
        detailMessage = (error as { reason: string }).reason;
      } else if ('message' in error && typeof (error as { message: string }).message === 'string') {
        const fullMsg = (error as { message: string }).message;
        if (fullMsg.includes('execution reverted')) {
          detailMessage = fullMsg;
        } else {
          detailMessage = fullMsg;
        }
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to relay transaction',
        message: detailMessage
      },
      { status: 500 }
    );
  }
}
