import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import DAO_ABI from '@/lib/DAOVoting.abi.json';

const DAO_ADDRESS = process.env.NEXT_PUBLIC_DAO_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    if (!DAO_ADDRESS || !ethers.isAddress(DAO_ADDRESS)) {
      return NextResponse.json({ success: true, notifications: [] });
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const daoContract = new ethers.Contract(DAO_ADDRESS, DAO_ABI, provider);

    let memberCount = 0;
    try {
      const count = await daoContract.memberCount();
      memberCount = Number(count);
    } catch {
      memberCount = 1;
    }

    if (account && ethers.isAddress(account)) {
      try {
        const isMember = await daoContract.isMember(account);
        if (!isMember) {
          // Si el usuario no es socio, no recibe notificaciones de gobernanza
          return NextResponse.json({ success: true, notifications: [] });
        }
      } catch {
        // En caso de fallo de red, se continua
      }
    }

    let proposalCount = 0;
    try {
      const count = await daoContract.proposalCount();
      proposalCount = Number(count);
    } catch {
      proposalCount = 0;
    }

    const notifications = [];

    for (let i = 1; i <= proposalCount; i++) {
      try {
        const prop = await daoContract.getProposal(i);
        const [
          id,
          title,
          recipient,
          amount,
          votingDeadline,
          ,
          executed,
          forVotes,
          againstVotes,
          abstainVotes,
          ,
          secondPeriod,
          rejected
        ] = prop;

        const propId = Number(id);
        const amountETH = ethers.formatEther(amount);
        const deadlineNum = Number(votingDeadline);
        const forNum = Number(forVotes);
        const againstNum = Number(againstVotes);
        const abstainNum = Number(abstainVotes);
        const totalVotes = forNum + againstNum + abstainNum;

        // 1. Notificación de ejecución inmediata por unanimidad del 100% de los socios
        if (executed && memberCount > 0 && forNum === memberCount) {
          notifications.push({
            id: `unanimous_exec_${propId}`,
            proposalId: propId,
            title: `⚡ ¡Unanimidad Alcanzada en Propuesta #${propId}!`,
            message: `El 100% de los socios inscritos (${forNum}/${memberCount}) aprobaron por unanimidad "${title}". Se ejecutó inmediatamente y se desembolsaron ${amountETH} ETH al beneficiario.`,
            type: 'UNANIMOUS_EXECUTION',
            timestamp: deadlineNum * 1000,
            recipient,
            amountETH
          });
        }

        // 2. Notificación al terminar la votación de la propuesta (cuando finaliza el periodo de votación)
        let isFinished = false;
        try {
          isFinished = await daoContract.isVotingFinished(propId);
        } catch {
          isFinished = totalVotes >= memberCount;
        }

        if (isFinished && !executed && !rejected && !secondPeriod) {
          const approved = forNum > againstNum;
          notifications.push({
            id: `voting_finished_${propId}`,
            proposalId: propId,
            title: `🗳️ Votación Finalizada en Propuesta #${propId}`,
            message: `La votación para "${title}" ha concluido. Resultado: ${forNum} A Favor vs ${againstNum} En Contra. ${approved ? '✅ Propuesta Aprobada.' : '❌ Propuesta Rechazada.'}`,
            type: 'VOTING_FINISHED',
            timestamp: deadlineNum * 1000,
            recipient,
            amountETH
          });
        }

        // 3. Notificación de propuesta rechazada
        if (rejected) {
          notifications.push({
            id: `rejected_${propId}`,
            proposalId: propId,
            title: `❌ Propuesta #${propId} Rechazada`,
            message: `La propuesta "${title}" fue rechazada definitivamente por la mayoría de la DAO.`,
            type: 'PROPOSAL_REJECTED',
            timestamp: deadlineNum * 1000,
            recipient,
            amountETH
          });
        }

        // 4. Notificación de 2º periodo de votación (repechaje por abstención)
        if (secondPeriod && !executed && !rejected) {
          notifications.push({
            id: `second_period_${propId}`,
            proposalId: propId,
            title: `⚖️ 2º Periodo de Votación Activo #${propId}`,
            message: `La propuesta "${title}" requiere votación de desempate por mayoría de abstención. ¡Ingresa a votar!`,
            type: 'SECOND_PERIOD',
            timestamp: deadlineNum * 1000,
            recipient,
            amountETH
          });
        }

        // 5. Notificación de creación de propuesta
        notifications.push({
          id: `created_${propId}`,
          proposalId: propId,
          title: `🛡️ Nueva Propuesta #${propId} Creada`,
          message: `Se ha registrado la propuesta "${title}" por un monto de ${amountETH} ETH. Tu voto es requerido.`,
          type: 'PROPOSAL_CREATED',
          timestamp: (deadlineNum - 7 * 24 * 3600) * 1000,
          recipient,
          amountETH
        });
      } catch (err) {
        console.error(`Error al procesar notificacion de propuesta ${i}:`, err);
      }
    }

    // Ordenar de más reciente a más antigua
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      notifications
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al obtener notificaciones';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
