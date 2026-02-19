"""
Deploy Echo Proof contract to Algorand Testnet.

Prerequisites:
    - ALGORAND_MNEMONIC environment variable set (25-word mnemonic)
    - Account must have Testnet ALGOs (use faucet: https://bank.testnet.algorand.network/)

Usage:
    python deploy.py

Output:
    Prints the App ID for use in backend .env
"""

import os
import base64
from algosdk import mnemonic, account
from algosdk.v2client import algod
from algosdk.transaction import ApplicationCreateTxn, StateSchema, OnComplete, wait_for_confirmation


# ─── Configuration ──────────────────────────────────────────────────────

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""  # AlgoNode public: no token needed


def get_algod_client():
    """Create Algod client pointing to Testnet."""
    return algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)


def get_deployer_account():
    """Recover deployer account from mnemonic."""
    mn = os.environ.get("ALGORAND_MNEMONIC")
    if not mn:
        raise ValueError(
            "ALGORAND_MNEMONIC environment variable not set.\n"
            "Set it to your 25-word Algorand mnemonic.\n"
            "Get Testnet ALGOs at: https://bank.testnet.algorand.network/"
        )
    private_key = mnemonic.to_private_key(mn)
    address = account.address_from_private_key(private_key)
    return private_key, address


def read_teal(filename):
    """Read compiled TEAL file."""
    with open(filename, "r") as f:
        return f.read()


def deploy():
    """Deploy the Echo Proof contract to Testnet."""
    print("🚀 Deploying Echo Proof contract to Algorand Testnet...")

    client = get_algod_client()
    private_key, sender = get_deployer_account()

    print(f"📍 Deployer address: {sender}")

    # Check balance
    account_info = client.account_info(sender)
    balance = account_info.get("amount", 0)
    print(f"💰 Account balance: {balance / 1_000_000:.6f} ALGO")

    if balance < 1_000_000:  # Minimum 1 ALGO
        raise ValueError(
            f"Insufficient balance ({balance / 1_000_000:.6f} ALGO).\n"
            f"Get Testnet ALGOs at: https://bank.testnet.algorand.network/\n"
            f"Address: {sender}"
        )

    # Read compiled TEAL
    approval_teal = read_teal("approval.teal")
    clear_teal = read_teal("clear.teal")

    # Compile TEAL to bytecode
    approval_result = client.compile(approval_teal)
    approval_program = base64.b64decode(approval_result["result"])

    clear_result = client.compile(clear_teal)
    clear_program = base64.b64decode(clear_result["result"])

    print(f"📦 Approval program: {len(approval_program)} bytes")
    print(f"📦 Clear program: {len(clear_program)} bytes")

    # Schema: 3 global state entries (app_name, version, total_records)
    global_schema = StateSchema(num_uints=1, num_byte_slices=2)
    local_schema = StateSchema(num_uints=0, num_byte_slices=0)

    # Get suggested params
    params = client.suggested_params()

    # Create application
    txn = ApplicationCreateTxn(
        sender=sender,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_program,
        clear_program=clear_program,
        global_schema=global_schema,
        local_schema=local_schema,
    )

    # Sign and submit
    signed_txn = txn.sign(private_key)
    tx_id = client.send_transaction(signed_txn)
    print(f"📤 Transaction submitted: {tx_id}")

    # Wait for confirmation
    result = wait_for_confirmation(client, tx_id, 4)
    app_id = result.get("application-index", 0)

    print("\n" + "=" * 60)
    print(f"✅ CONTRACT DEPLOYED SUCCESSFULLY!")
    print(f"=" * 60)
    print(f"   App ID:     {app_id}")
    print(f"   Tx ID:      {tx_id}")
    print(f"   Network:    Testnet")
    print(f"   Explorer:   https://testnet.explorer.perawallet.app/application/{app_id}")
    print(f"=" * 60)
    print(f"\n📋 Add to your backend .env file:")
    print(f"   ALGORAND_APP_ID={app_id}")
    print(f"   ALGORAND_MNEMONIC=<your_25_word_mnemonic>")
    print(f"   ALGORAND_NETWORK=testnet")
    print()

    return app_id


if __name__ == "__main__":
    app_id = deploy()
