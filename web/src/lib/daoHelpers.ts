import { ethers } from 'ethers';
import { getDAOContract, VoteType } from './contracts';

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
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.isMember(userAddress);
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
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.getUserBalance(userAddress);
}

/**
 * Obtiene la cantidad total de socios registrados
 */
export async function getMemberCount(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  const daoContract = getDAOContract(signerOrProvider);
  try {
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
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.getTotalDeposited();
}

/**
 * Obtiene el balance del contrato DAO
 */
export async function getDAOBalance(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  const daoContract = getDAOContract(signerOrProvider);
  const provider = 'provider' in signerOrProvider ? signerOrProvider.provider : signerOrProvider;
  if (provider) {
    const code = await provider.getCode(daoContract.target);
    if (code === '0x') {
      throw new Error('El contrato no está desplegado en la dirección configurada.');
    }
  }
  return await daoContract.getBalance();
}

/**
 * Obtiene la cantidad total de propuestas creadas
 */
export async function getProposalCount(
  signerOrProvider: ethers.Signer | ethers.Provider
): Promise<bigint> {
  const daoContract = getDAOContract(signerOrProvider);
  try {
    return await daoContract.proposalCount();
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'BAD_DATA') {
      const contractAddress = typeof daoContract.target === 'string' ? daoContract.target : await daoContract.getAddress();
      throw new Error(`Contrato no encontrado en ${contractAddress}. Verifica tu archivo .env.local.`);
    }
    throw error;
  }
}

/**
 * Obtiene los detalles de una propuesta por ID
 */
export async function getProposal(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
) {
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.getProposal(proposalId);
}

/**
 * Verifica si una propuesta puede ejecutarse
 */
export async function canExecuteProposal(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number
): Promise<boolean> {
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.canExecute(proposalId);
}

/**
 * Obtiene el voto emitido por un usuario para una propuesta
 */
export async function getUserVote(
  signerOrProvider: ethers.Signer | ethers.Provider,
  proposalId: number,
  userAddress: string
): Promise<VoteType> {
  const daoContract = getDAOContract(signerOrProvider);
  return await daoContract.getUserVote(proposalId, userAddress);
}
