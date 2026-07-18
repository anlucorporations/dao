'use client';

import { DAO_CONTRACT_ADDRESS } from '@/lib/contracts';

export default function ConfigCheck({ children }: { children: React.ReactNode }) {
  const isConfigured = DAO_CONTRACT_ADDRESS;

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Configuration Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The smart contracts have not been deployed or configured yet.
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  <strong>Missing Configuration:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                  {!DAO_CONTRACT_ADDRESS && (
                    <li>NEXT_PUBLIC_DAO_CONTRACT_ADDRESS</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-3 dark:text-white">Quick Start:</h2>

              <div className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="mb-4">
                  <div className="text-green-400"># Terminal 1: Start Anvil</div>
                  <div>anvil</div>
                </div>

                <div>
                  <div className="text-green-400"># Terminal 2: Deploy contracts</div>
                  <div>./deploy-local.sh</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                📖 Detailed Instructions
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                Follow these steps to get started:
              </p>
              <ol className="list-decimal list-inside text-sm text-blue-800 dark:text-blue-400 space-y-1">
                <li>Open a terminal and run <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">anvil</code></li>
                <li>In another terminal, run <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">./deploy-local.sh</code></li>
                <li>The script will automatically configure the contracts</li>
                <li>Refresh this page</li>
              </ol>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
                See <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">DEPLOYMENT_GUIDE.md</code> for more details
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Manual Configuration
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                If you prefer manual setup:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <li>Deploy contracts using Foundry</li>
                <li>Create <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">web/.env.local</code></li>
                <li>Add contract addresses to environment variables</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                Current Status:
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={DAO_CONTRACT_ADDRESS ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {DAO_CONTRACT_ADDRESS ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">DAO Contract</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
