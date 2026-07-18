import { ethers } from 'ethers';
import DAOVotingABI from './DAOVoting.abi.json';
import MinimalForwarderABI from './MinimalForwarder.abi.json';

export const DAO_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS || '';
export const FORWARDER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS || '';

export function getDAOContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!DAO_CONTRACT_ADDRESS || DAO_CONTRACT_ADDRESS === '') {
    throw new Error('DAO_CONTRACT_ADDRESS not configured. Please check your .env.local file');
  }
  if (!ethers.isAddress(DAO_CONTRACT_ADDRESS)) {
    throw new Error(`Invalid DAO_CONTRACT_ADDRESS: ${DAO_CONTRACT_ADDRESS}`);
  }
  return new ethers.Contract(DAO_CONTRACT_ADDRESS, DAOVotingABI, signerOrProvider);
}

export function getForwarderContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  if (!FORWARDER_CONTRACT_ADDRESS || FORWARDER_CONTRACT_ADDRESS === '') {
    throw new Error('FORWARDER_CONTRACT_ADDRESS not configured. Please check your .env.local file');
  }
  if (!ethers.isAddress(FORWARDER_CONTRACT_ADDRESS)) {
    throw new Error(`Invalid FORWARDER_CONTRACT_ADDRESS: ${FORWARDER_CONTRACT_ADDRESS}`);
  }
  return new ethers.Contract(FORWARDER_CONTRACT_ADDRESS, MinimalForwarderABI, signerOrProvider);
}

export enum VoteType {
  ABSTAIN = 0,
  FOR = 1,
  AGAINST = 2
}

export interface Proposal {
  id: bigint;
  recipient: string;
  amount: bigint;
  votingDeadline: bigint;
  executionDelay: bigint;
  executed: boolean;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  description: string;
}

export interface ForwardRequest {
  from: string;
  to: string;
  value: bigint;
  gas: bigint;
  nonce: bigint;
  data: string;
}
