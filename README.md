# DAO Voting Platform

Full-stack DAO voting application with gasless transactions using EIP-2771 meta-transactions.

## Features

- ✅ **Gasless Voting**: Users vote without paying gas fees (relayer pays)
- ✅ **Proposal Management**: Create, vote, and execute proposals
- ✅ **Meta-Transactions**: EIP-2771 implementation with MinimalForwarder
- ✅ **Automatic Execution**: Daemon monitors and executes approved proposals
- ✅ **MetaMask Integration**: Easy wallet connection
- ✅ **Real-time Updates**: Live proposal statistics and voting

## Project Structure

```
.
├── sc/                      # Smart contracts (Foundry)
│   ├── src/
│   │   ├── DAOVoting.sol           # Main DAO contract with ERC2771Context
│   │   └── MinimalForwarder.sol    # EIP-2771 forwarder
│   ├── test/                       # Contract tests
│   ├── script/Deploy.s.sol         # Deployment script
│   └── .env.example
│
└── web/                     # Next.js frontend
    ├── src/
    │   ├── app/
    │   │   ├── api/relay/          # Meta-transaction relayer
    │   │   ├── api/daemon/         # Proposal execution daemon
    │   │   └── page.tsx            # Main UI
    │   ├── components/             # React components
    │   └── lib/                    # Web3 utilities, ABIs
    └── .env.example
```

## Quick Start

### 🚀 Automated Setup (Recommended)

```bash
# Terminal 1: Start Anvil
anvil

# Terminal 2: Deploy everything automatically
./deploy-local.sh

# Start the web app
cd web
npm run dev
```

**That's it!** Open http://localhost:3000

### ✅ Verify Setup

```bash
./check-setup.sh
```

This will verify that everything is configured correctly.

### 📱 Configure MetaMask

1. Add Localhost network:
   - Network Name: **Localhost**
   - RPC URL: **http://127.0.0.1:8545**
   - Chain ID: **31337**
   - Currency: **ETH**

2. Import an Anvil account:
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - (This is Anvil account #1, different from relayer)

### 🎯 Use the Application

1. **Connect MetaMask** - Click "Connect Wallet"
2. **Deposit ETH** - Send ETH to DAO to participate
3. **Create Proposals** - Requires ≥10% of DAO balance
4. **Vote** - Gasless! Relayer pays the gas
5. **Auto-Execution** - Daemon executes approved proposals

---

## 🔧 Troubleshooting

Having issues? See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.

## 📖 Manual Setup

For detailed manual setup instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## Smart Contracts

### DAOVoting.sol

Main DAO contract with:
- Proposal creation (requires 10% of DAO balance)
- Voting system (FOR, AGAINST, ABSTAIN)
- Vote tracking and statistics
- Automatic execution after approval + delay
- ERC2771Context integration for gasless transactions

### MinimalForwarder.sol

EIP-2771 compliant forwarder:
- Validates meta-transaction signatures
- Forwards calls to target contracts
- Nonce tracking for replay protection

## Key Concepts

### Gasless Voting (Meta-Transactions)

1. User signs vote off-chain (no gas needed)
2. Web app (relayer) submits to MinimalForwarder
3. MinimalForwarder validates and forwards to DAO contract
4. DAO contract extracts original sender via ERC2771Context

### Proposal Lifecycle

```
Create → Vote → Deadline → Execution Delay → Execute → Completed
```

- **Create**: Users with ≥10% DAO balance can create
- **Vote**: Anyone with minimum balance can vote (gasless)
- **Deadline**: Voting closes after duration
- **Execution Delay**: 1 day safety period
- **Execute**: Daemon or anyone can trigger if approved

## Development

### Run Tests

```bash
cd sc
forge test -vvv
```

### Deploy to Testnet

```bash
# Edit .env with testnet RPC and funded private key
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast --verify
```

### Build for Production

```bash
cd web
npm run build
npm start
```

## Environment Variables

### Smart Contracts (sc/.env)

```env
PRIVATE_KEY=0x...              # Deployer private key
RPC_URL=http://127.0.0.1:8545  # Network RPC
MINIMUM_BALANCE=100000000000000000  # 0.1 ETH in wei
```

### Web App (web/.env.local)

```env
# Public (accessible in browser)
NEXT_PUBLIC_DAO_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_FORWARDER_CONTRACT_ADDRESS=0x...

# Private (server-side only)
RELAYER_PRIVATE_KEY=0x...
RELAYER_ADDRESS=0x...
RPC_URL=http://127.0.0.1:8545
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` files
- Keep private keys secure
- Relayer key should have limited funds (only for gas)
- Test thoroughly before mainnet deployment
- Consider upgradeability patterns for production

## License

MIT
