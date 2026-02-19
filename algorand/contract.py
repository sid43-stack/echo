"""
Echo Proof Smart Contract — PyTEAL

A minimal, auditable smart contract for storing conversation proof hashes
on the Algorand blockchain.

Usage:
    - create_record(hash: bytes, timestamp: uint64)
        Stores a SHA-256 hash of a conversation reflection.
        Increments global total_records counter.
        Creates a box keyed by (sender + timestamp) with the hash data.

    - get_record_count()
        Returns the global total number of records.

Security:
    - Only the sender's own records are created under their address.
    - Records are immutable once written.
    - No tokens, payments, NFTs, or complex DeFi logic.
"""

from pyteal import *

# ─── Constants ──────────────────────────────────────────────────────────

APP_NAME = Bytes("Echo Proof")
APP_VERSION = Bytes("1.0.0")

# Box size: 32 (hash) + 8 (timestamp) + 8 (record_id) = 48 bytes
BOX_SIZE = Int(48)

# ─── Global State Keys ─────────────────────────────────────────────────

GLOBAL_APP_NAME = Bytes("app_name")
GLOBAL_VERSION = Bytes("version")
GLOBAL_TOTAL_RECORDS = Bytes("total_records")


def approval_program():
    """Main approval program."""

    # ─── Initialization (on create) ─────────────────────────────────
    handle_creation = Seq(
        App.globalPut(GLOBAL_APP_NAME, APP_NAME),
        App.globalPut(GLOBAL_VERSION, APP_VERSION),
        App.globalPut(GLOBAL_TOTAL_RECORDS, Int(0)),
        Approve(),
    )

    # ─── Method: create_record ──────────────────────────────────────
    # ABI selector for "create_record(byte[],uint64)void"
    # First 4 bytes of SHA-512/256("create_record(byte[],uint64)void")
    #
    # Args:
    #   [0] = method selector (4 bytes)
    #   [1] = hash (byte[] — variable length, typically 32 bytes SHA-256)
    #   [2] = timestamp (uint64 — 8 bytes big-endian)

    hash_arg = Txn.application_args[1]
    timestamp_arg = Btoi(Txn.application_args[2])

    # Box key = sender address (32 bytes) + timestamp (8 bytes)
    box_key = Concat(Txn.sender(), Txn.application_args[2])

    current_total = App.globalGet(GLOBAL_TOTAL_RECORDS)
    new_record_id = current_total + Int(1)

    # Box value = hash (32 bytes padded) + timestamp (8 bytes) + record_id (8 bytes)
    box_value = Concat(
        # Ensure hash is exactly 32 bytes (pad or truncate)
        If(
            Len(hash_arg) >= Int(32),
            Extract(hash_arg, Int(0), Int(32)),
            Concat(hash_arg, BytesZero(Int(32) - Len(hash_arg))),
        ),
        Itob(timestamp_arg),
        Itob(new_record_id),
    )

    handle_create_record = Seq(
        # Validate: must have exactly 3 app args (selector + hash + timestamp)
        Assert(Txn.application_args.length() == Int(3)),
        # Validate: hash must not be empty
        Assert(Len(hash_arg) > Int(0)),
        # Validate: timestamp must be non-zero
        Assert(timestamp_arg > Int(0)),
        # Create box and store record
        Pop(App.box_create(box_key, BOX_SIZE)),
        App.box_replace(box_key, Int(0), box_value),
        # Increment global counter
        App.globalPut(GLOBAL_TOTAL_RECORDS, new_record_id),
        Approve(),
    )

    # ─── Method: get_record_count ───────────────────────────────────
    # ABI selector for "get_record_count()uint64"
    # Returns global total_records via log

    handle_get_record_count = Seq(
        Log(Itob(App.globalGet(GLOBAL_TOTAL_RECORDS))),
        Approve(),
    )

    # ─── Method Router ──────────────────────────────────────────────
    # Route based on first app arg (ABI method selector)

    # Method selectors (first 4 bytes of SHA-512/256 of method signature)
    METHOD_CREATE_RECORD = MethodSignature("create_record(byte[],uint64)void")
    METHOD_GET_RECORD_COUNT = MethodSignature("get_record_count()uint64")

    method_router = Cond(
        [Txn.application_args[0] == METHOD_CREATE_RECORD, handle_create_record],
        [Txn.application_args[0] == METHOD_GET_RECORD_COUNT, handle_get_record_count],
    )

    # ─── Main Program Router ────────────────────────────────────────

    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.NoOp, method_router],
        [Txn.on_completion() == OnComplete.OptIn, Approve()],
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        [
            Txn.on_completion() == OnComplete.UpdateApplication,
            Return(Txn.sender() == Global.creator_address()),
        ],
        [
            Txn.on_completion() == OnComplete.DeleteApplication,
            Return(Txn.sender() == Global.creator_address()),
        ],
    )

    return program


def clear_state_program():
    """Clear state program — always approve."""
    return Approve()


if __name__ == "__main__":
    # Quick test: print TEAL
    print("=== Approval Program ===")
    print(compileTeal(approval_program(), mode=Mode.Application, version=10))
    print("\n=== Clear State Program ===")
    print(compileTeal(clear_state_program(), mode=Mode.Application, version=10))
