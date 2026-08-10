import { ethers } from 'ethers';
import { getDAOContract, VoteType, Proposal } from './contracts';

/**
 * Funciones de interacción directa con el Smart Contract de la DAO (pagando gas)
 */

/**
 * Registra un nuevo socio depositando 3 ETH
 */
export async function registerMemberDirect(signer: ethers.Signer) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.registerMember({
    value: ethers.parseEther('3')
  });
  return await tx.wait();
}

/**
 * Verifica si una dirección es socio de la DAO
 */
export async function checkIsMember(
  signerOrProvider: ethers.Signer | ethers.Provider,
  userAddress: string
): Promise<boolean> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.isMember(userAddress);
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'BAD_DATA') {
      console.warn('BAD_DATA al llamar isMember. El contrato no responde o no está desplegado en la red actual.');
      return false;
    }
    return false;
  }
}

/**
 * Crea una propuesta pagando gas directamente
 */
export async function createProposalDirect(
  signer: ethers.Signer,
  title: string,
  recipient: string,
  amount: bigint,
  votingDuration: number,
  description: string
) {
  const daoContract = getDAOContract(signer);

  const tx = await daoContract.createProposal(
    title,
    recipient,
    amount,
    votingDuration,
    description
  );

  return await tx.wait();
}

/**
 * Vota en una propuesta pagando gas directamente
 */
export async function voteDirect(
  signer: ethers.Signer,
  proposalId: number,
  voteType: VoteType
) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.vote(proposalId, voteType);
  return await tx.wait();
}

/**
 * Activa el segundo periodo de votación (repechaje) cuando la abstención es la mayoría
 */
export async function enableSecondPeriodDirect(
  signer: ethers.Signer,
  proposalId: number,
  extraDuration: number = 3 * 24 * 60 * 60
) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.enableSecondPeriod(proposalId, extraDuration);
  return await tx.wait();
}

/**
 * Verifica y marca explícitamente una propuesta como rechazada
 */
export async function checkAndMarkRejectedDirect(
  signer: ethers.Signer,
  proposalId: number
) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.checkAndMarkRejected(proposalId);
  return await tx.wait();
}

/**
 * Deposita ETH adicional en la DAO
 */
export async function depositDirect(
  signer: ethers.Signer,
  amount: bigint
) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.deposit({ value: amount });
  return await tx.wait();
}

/**
 * Ejecuta una propuesta aprobada pagando gas directamente
 */
export async function executeProposalDirect(
  signer: ethers.Signer,
  proposalId: number
) {
  const daoContract = getDAOContract(signer);
  const tx = await daoContract.executeProposal(proposalId);
  return await tx.wait();
}

/**
 * Obtiene el balance depositado por el usuario en la DAO
 */
export async function getUserBalance(
  signerOrProvider: ethers.Signer | ethers.Provider,
  userAddress: string
): Promise<bigint> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.getUserBalance(userAddress);
  } catch {
    return BigInt(0);
  }
}

/**
 * Obtiene la cantidad total de socios registrados
 */
export async function getMemberCount(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.memberCount();
  } catch {
    return BigInt(0);
  }
}

/**
 * Obtiene el balance total acumulado en la DAO
 */
export async function getTotalDeposited(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.getTotalDeposited();
  } catch {
    return BigInt(0);
  }
}

/**
 * Obtiene el balance del contrato DAO
 */
export async function getDAOBalance(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.getBalance();
  } catch {
    return BigInt(0);
  }
}

/**
 * Obtiene la cantidad total de propuestas creadas
 */
export async function getProposalCount(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.proposalCount();
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'BAD_DATA') {
      console.warn('Contrato no desplegado o BAD_DATA en proposalCount.');
      return BigInt(0);
    }
    return BigInt(0);
  }
}

/**
 * Obtiene los detalles de una propuesta por ID y los mapea a la interfaz Proposal
 */
export async function getProposal(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
): Promise<Proposal> {
  const daoContract = getDAOContract(signerOrProvider);
  const p = await daoContract.getProposal(proposalId);
  return {
    id: BigInt(p.id || p[0]),
    title: p.title || p[1],
    recipient: p.recipient || p[2],
    amount: BigInt(p.amount || p[3]),
    votingDeadline: BigInt(p.votingDeadline || p[4]),
    executionDelay: BigInt(p.executionDelay || p[5]),
    executed: Boolean(p.executed || p[6]),
    forVotes: BigInt(p.forVotes || p[7]),
    againstVotes: BigInt(p.againstVotes || p[8]),
    abstainVotes: BigInt(p.abstainVotes || p[9]),
    description: p.description || p[10],
    secondPeriod: Boolean(p.secondPeriod !== undefined ? p.secondPeriod : p[11]),
    rejected: Boolean(p.rejected !== undefined ? p.rejected : p[12])
  };
}

/**
 * Consulta si la votación de una propuesta ya finalizó
 */
export async function isVotingFinished(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
): Promise<boolean> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.isVotingFinished(proposalId);
  } catch {
    return false;
  }
}

/**
 * Consulta si la abstención es la mayoría en una propuesta
 */
export async function isAbstentionMajority(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
): Promise<boolean> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.isAbstentionMajority(proposalId);
  } catch {
    return false;
  }
}

/**
 * Verifica si una propuesta puede ejecutarse
 */
export async function canExecuteProposal(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
): Promise<boolean> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.canExecute(proposalId);
  } catch {
    return false;
  }
}

/**
 * Obtiene el voto emitido por un usuario para una propuesta
 */
export async function getUserVote(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number,
  userAddress: string
): Promise<VoteType> {
  try {
    const daoContract = getDAOContract(signerOrProvider);
    return await daoContract.getUserVote(proposalId, userAddress);
  } catch {
    return VoteType.ABSTAIN;
  }
}
