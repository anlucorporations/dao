# 🚀 Quick Start - 3 Simple Steps

## Step 1: Start Anvil

Open a terminal and run:

```bash
anvil
```

✅ You should see: "Listening on 127.0.0.1:8545"

**Keep this terminal open!**

---

## Step 2: Deploy Contracts

Open a **NEW** terminal and run:

```bash
cd /Users/joseviejo/2025/cc/40_dao/newDao
./deploy-local.sh
```

✅ You should see:
```
✅ Deployment completado exitosamente
```

With contract addresses like:
```
MinimalForwarder: 0x5FbDB...
DAOVoting:       0xe7f17...
```

---

## Step 3: Start Web App

In the same terminal (or a new one):

```bash
cd web
npm run dev
```

✅ You should see:
```
Local:   http://localhost:3000
```

---

## Step 4: Open Browser

1. Go to: **http://localhost:3000**

2. If you see "Configuration Required" screen:
   - Something went wrong in Step 2
   - Run: `./check-setup.sh` to diagnose
   - See TROUBLESHOOTING.md

3. If you see the DAO interface:
   - **Success!** 🎉
   - Now configure MetaMask (see below)

---

## Step 5: Configure MetaMask

### Add Network

1. Open MetaMask
2. Click network dropdown (top)
3. "Add Network" → "Add a network manually"
4. Enter:
   ```
   Network Name: Localhost
   RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency: ETH
   ```
5. Save

### Import Account

1. Click account icon
2. "Import Account"
3. Paste private key:
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
4. Import

✅ You should now have ~10,000 ETH

---

## Step 6: Use the DAO

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Approve in MetaMask

2. **Deposit to DAO**
   - In "DAO Treasury" section
   - Enter amount (e.g., 10 ETH)
   - Click "Deposit to DAO"
   - Confirm in MetaMask

3. **Create a Proposal**
   - Recipient: Any address (e.g., `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`)
   - Amount: 1 ETH
   - Duration: 7 days
   - Description: "Test proposal"
   - Click "Create Proposal (Gasless)"
   - **Just sign in MetaMask** (no gas!)

4. **Vote on Proposal**
   - Click "Vote For" (or Against/Abstain)
   - **Just sign in MetaMask** (no gas!)
   - See vote count update instantly

5. **Watch Auto-Execution**
   - After voting deadline + 1 day
   - Daemon automatically executes approved proposals
   - Check browser console for logs

---

## ❓ Problems?

Run the diagnostic tool:

```bash
./check-setup.sh
```

See full troubleshooting guide: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📝 Common Issues

### "Configuration Required" screen

**Problem**: Contracts not deployed or .env.local missing

**Fix**:
```bash
./deploy-local.sh
```

### "MetaMask not detected"

**Problem**: MetaMask not installed

**Fix**: Install MetaMask browser extension

### "User rejected transaction"

**Problem**: You clicked "Reject" in MetaMask

**Fix**: Click "Vote For/Against" again and click "Sign" this time
- It's just a signature, **no gas cost!**

### "Insufficient balance to create proposal"

**Problem**: You need ≥10% of DAO balance

**Fix**:
1. Check "Treasury Balance" in UI
2. Make sure your wallet has enough ETH
3. Or deposit more to the DAO first

---

## 🎯 Quick Test Flow

Want to test everything? Follow this:

1. ✅ Start Anvil
2. ✅ Deploy: `./deploy-local.sh`
3. ✅ Start web: `cd web && npm run dev`
4. ✅ Open http://localhost:3000
5. ✅ Connect MetaMask
6. ✅ Deposit 50 ETH to DAO
7. ✅ Create proposal for 5 ETH
8. ✅ Vote FOR
9. ✅ Import another Anvil account and vote
10. ✅ Check proposal status

---

## 🌟 Pro Tips

- **Multiple Voters**: Import more Anvil accounts to vote from different addresses
- **View Transactions**: Watch Anvil terminal to see all transactions
- **Console Logs**: Open browser DevTools (F12) to see daemon logs
- **Reset**: Kill Anvil (Ctrl+C) and restart for fresh blockchain

---

## Next Steps

- Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for testnet deployment
- Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions
- Check [README.md](README.md) for architecture details
