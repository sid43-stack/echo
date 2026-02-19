"""
Compile Echo Proof contract to TEAL files.

Usage:
    python compile.py

Output:
    approval.teal
    clear.teal
"""

from pyteal import compileTeal, Mode
from contract import approval_program, clear_state_program


def compile():
    """Compile PyTEAL to TEAL and write to files."""
    approval_teal = compileTeal(
        approval_program(), mode=Mode.Application, version=10
    )
    clear_teal = compileTeal(
        clear_state_program(), mode=Mode.Application, version=10
    )

    with open("approval.teal", "w") as f:
        f.write(approval_teal)
    print(f"✅ Compiled approval.teal ({len(approval_teal)} bytes)")

    with open("clear.teal", "w") as f:
        f.write(clear_teal)
    print(f"✅ Compiled clear.teal ({len(clear_teal)} bytes)")


if __name__ == "__main__":
    compile()
