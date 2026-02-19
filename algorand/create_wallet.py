from algosdk import account, mnemonic

# generate private key + public address
private_key, address = account.generate_account()

# convert private key to 25 word mnemonic
mnemo = mnemonic.from_private_key(private_key)

print("\n===== SAVE THIS CAREFULLY =====\n")
print("ADDRESS:\n", address)
print("\n25 WORD MNEMONIC:\n", mnemo)
