import { ethers } from 'ethers';

export interface WindowWithEthereum extends Window {
  ethereum?: ethers.Eip1193Provider & {
    on?: (event: string, handler: (...args: unknown[]) => void) => void;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  };
}

declare const window: WindowWithEthereum;

export async function connectWallet(): Promise<string | null> {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed. Please install MetaMask to use this app.');
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
}

export function getProvider(): ethers.BrowserProvider | null {
  if (typeof window.ethereum === 'undefined') {
    return null;
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner(): Promise<ethers.Signer | null> {
  const provider = getProvider();
  if (!provider) return null;

  try {
    return await provider.getSigner();
  } catch (error) {
    console.error('Error getting signer:', error);
    return null;
  }
}

export async function getBalance(address: string): Promise<string> {
  const provider = getProvider();
  if (!provider) return '0';

  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
}

export async function switchNetwork(chainId: number): Promise<boolean> {
  if (typeof window.ethereum === 'undefined') {
    return false;
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
    return true;
  } catch (error: unknown) {
    // This error code indicates that the chain has not been added to MetaMask
    if (error && typeof error === 'object' && 'code' in error && error.code === 4902) {
      console.error('Network not added to MetaMask');
    }
    console.error('Error switching network:', error);
    return false;
  }
}
