# Echo Proof — Algorand Smart Contract

Minimal, auditable smart contract for storing conversation proof hashes on-chain.

## Overview

This contract stores SHA-256 hashes of Echo conversation reflections on Algorand Testnet, enabling tamper-proof verification without storing any actual conversation text on-chain.

## Contract Design

### State
- **Global**: `app_name` (bytes), `version` (bytes), `total_records` (uint64)
- **Box Storage**: Each record keyed by `sender_address + timestamp`, storing hash (32 bytes), timestamp (uint64), record_id (uint64)

### Methods
- `create_record(hash: byte[], timestamp: uint64)` — stores a proof hash
- `get_record_count()` — returns total records

## Prerequisites

- Python 3.12+
- AlgoKit CLI (`pipx install algokit`)
- Algorand Testnet account with funds (use [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/))

## Setup & Deployment

```bash
# 1. Install AlgoKit (if not already)
pipx install algokit

# 2. Navigate to this directory
cd algorand

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Compile the contract
python compile.py

# 5. Deploy to Testnet
# Set environment variables first:
#   ALGORAND_MNEMONIC = your 25-word Algorand account mnemonic
# Then run:
python deploy.py

# 6. Note the App ID from the deployment output
# Add it to your backend .env file:
#   ALGORAND_APP_ID=<app_id>
#   ALGORAND_MNEMONIC=<your_mnemonic>
#   ALGORAND_NETWORK=testnet
```

## Files

- `contract.py` — PyTEAL smart contract source
- `compile.py` — Contract compilation script (generates TEAL)
- `deploy.py` — Testnet deployment script
- `requirements.txt` — Python dependencies
- `approval.teal` — Compiled approval program (generated)
- `clear.teal` — Compiled clear program (generated)

## App ID

After deployment, the App ID will be printed to console. Add it to your backend `.env`:

```
ALGORAND_APP_ID=<your_app_id>
ALGORAND_MNEMONIC=<your_25_word_mnemonic>
ALGORAND_NETWORK=testnet
```

## Security

- Contract only stores hashes — never raw text
- Only the sender can create records
- Records are immutable once written
- Box storage ensures data isolation per user
