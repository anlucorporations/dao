/**
 * Client-side daemon that periodically checks for executable proposals
 * This runs in the browser and calls the daemon API endpoint
 */

let daemonInterval: NodeJS.Timeout | null = null;

export function startDaemon(intervalMs: number = 60000) {
  if (daemonInterval) {
    console.log('Daemon already running');
    return;
  }
  // Run immediately
  checkProposals();

  // Then run periodically
  daemonInterval = setInterval(checkProposals, intervalMs);
}

export function stopDaemon() {
  if (daemonInterval) {
    clearInterval(daemonInterval);
    daemonInterval = null;
  }
}

async function checkProposals() {
  try {
    const response = await fetch('/api/daemon');
    const result = await response.json();

    if (result.executed && result.executed.length > 0) {
      console.log(`[Daemon] Executed proposals:`, result.executed);
    }

    if (result.errors && result.errors.length > 0) {
      console.warn(`[Daemon] Errors:`, result.errors);
    }
  } catch (error) {
    console.error('[Daemon] Error checking proposals:', error);
  }
}
