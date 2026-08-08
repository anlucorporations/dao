import { ethers } from 'ethers';
import { ForwardRequest } from './contracts';

const FORWARD_REQUEST_TYPE = [
  { name: 'from', type: 'address' },
  { name: 'to', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'gas', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'data', type: 'bytes' },
];

export async function signMetaTxRequest(
  signer: ethers.Signer,
  forwarder: ethers.Contract,
  input: Omit<ForwardRequest, 'nonce' | 'from'>
): Promise<{ request: ForwardRequest; signature: string }> {
  const from = await signer.getAddress();
  const nonce = await forwarder.getNonce(from);
  
  const request: ForwardRequest = {
    ...input,
    nonce: BigInt(nonce.toString()),
    from,
  };

  const provider = signer.provider;
  if (!provider) throw new Error('Proveedor Web3 no disponible');

  const network = await provider.getNetwork();
  const chainId = network.chainId;

  const domain = {
    name: 'MinimalForwarder',
    version: '1',
    chainId: Number(chainId),
    verifyingContract: await forwarder.getAddress(),
  };

  const types = {
    ForwardRequest: FORWARD_REQUEST_TYPE,
  };

  const signature = await signer.signTypedData(domain, types, {
    from: request.from,
    to: request.to,
    value: request.value.toString(),
    gas: request.gas.toString(),
    nonce: request.nonce.toString(),
    data: request.data,
  });

  return { request, signature };
}

export async function buildVoteRequest(
  to: string,
  from: string,
  proposalId: number,
  voteType: number
): Promise<Omit<ForwardRequest, 'nonce' | 'from'>> {
  const iface = new ethers.Interface([
    'function vote(uint256 _proposalId, uint8 _voteType)'
  ]);

  const data = iface.encodeFunctionData('vote', [proposalId, voteType]);

  return {
    to,
    value: BigInt(0),
    gas: BigInt(1000000),
    data,
  };
}

export async function buildCreateProposalRequest(
  to: string,
  from: string,
  title: string,
  recipient: string,
  amount: bigint,
  votingDuration: number,
  description: string
): Promise<Omit<ForwardRequest, 'nonce' | 'from'>> {
  const iface = new ethers.Interface([
    'function createProposal(string _title, address _recipient, uint256 _amount, uint256 _votingDuration, string _description)'
  ]);

  const data = iface.encodeFunctionData('createProposal', [
    title,
    recipient,
    amount,
    votingDuration,
    description
  ]);

  return {
    to,
    value: BigInt(0),
    gas: BigInt(2000000),
    data,
  };
}
