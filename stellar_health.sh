#!/usr/bin/env bash
set -euo pipefail

# Interactive helper for Stellar Health contracts
# Requirements: stellar-cli

# 1. Install Rust toolchain
read -rp "Install Rust (rustup + toolchain)? [y/N]: " INSTALL_RUST
if [[ "$INSTALL_RUST" =~ ^[Yy]$ ]]; then
  echo "Installing rustup and Rust..."
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --no-modify-path
  source "$HOME/.cargo/env"
  echo "Rust toolchain installed."
fi

# 2. Add WASM target
read -rp "Install WASM target (wasm32v1-none)? [y/N]: " INSTALL_TARGET
if [[ "$INSTALL_TARGET" =~ ^[Yy]$ ]]; then
  echo "Adding wasm32v1-none target..."
  rustup target add wasm32v1-none
  echo "WASM target added."
fi

# 3. Install Stellar CLI
read -rp "Install Stellar CLI? [y/N]: " INSTALL_STELLAR
if [[ "$INSTALL_STELLAR" =~ ^[Yy]$ ]]; then
  echo "Installing Stellar CLI..."
  if command -v brew >/dev/null 2>&1; then
    brew tap stellar/tap
    brew install stellar-cli
  else
    cargo install stellar-cli
  fi
  echo "Stellar CLI installed."
fi

# Prompt for network
read -rp "Select network [testnet/local] (default: testnet): " NETWORK
NETWORK=${NETWORK:-testnet}

echo "Using network: $NETWORK"

# Build contracts using Stellar CLI
do_build() {
  echo "Building contracts with Stellar CLI..."
  stellar contract build
  echo "Build complete."
}

# Deploy agent & relationship and alias them
do_deploy() {
  read -rp "Enter deployer identity (alias): " SOURCE

  # Agent contract deployment
  if stellar contract alias show agent &>/dev/null; then
    read -rp "Alias 'agent' exists. Redeploy Agent contract with new WASM? [y/N]: " REDEPLOY_AGENT
    if [[ "$REDEPLOY_AGENT" =~ ^[Yy]$ ]]; then
      echo "Redeploying Agent contract..."
      stellar contract deploy \
        --wasm target/wasm32v1-none/release/agent.wasm \
        --source-account "$SOURCE" \
        --network "$NETWORK" \
        --alias agent
      echo "Agent contract redeployed."
    else
      echo "Skipping Agent redeploy."
    fi
  else
    echo "Deploying Agent contract for the first time..."
    stellar contract deploy \
      --wasm target/wasm32v1-none/release/agent.wasm \
      --source-account "$SOURCE" \
      --network "$NETWORK" \
      --alias agent
    echo "Aliased as 'agent'."
  fi

  # Relationship contract deployment
  if stellar contract alias show relationship &>/dev/null; then
    read -rp "Alias 'relationship' exists. Redeploy Relationship contract with new WASM? [y/N]: " REDEPLOY_REL
    if [[ "$REDEPLOY_REL" =~ ^[Yy]$ ]]; then
      echo "Redeploying Relationship contract..."
      stellar contract deploy \
        --wasm target/wasm32v1-none/release/relationship.wasm \
        --source-account "$SOURCE" \
        --network "$NETWORK" \
        --alias relationship
      echo "Relationship contract redeployed."
    else
      echo "Skipping Relationship redeploy."
    fi
  else
    echo "Deploying Relationship contract for the first time..."
    stellar contract deploy \
      --wasm target/wasm32v1-none/release/relationship.wasm \
      --source-account "$SOURCE" \
      --network "$NETWORK" \
      --alias relationship
    echo "Aliased as 'relationship'."
  fi

  echo "Deployment step complete."
}

# Generate and optionally register an agent (auto-register PAT/PRO)
do_generate() {
  read -rp "Enter new identity name: " NAME
  stellar keys generate "$NAME"
  stellar keys fund "$NAME" --network "$NETWORK"
  echo "Generated and funded '$NAME'."

  read -rp "Do you want to register a role for '$NAME' now? [y/N]: " REG
  if [[ "$REG" =~ ^[Yy]$ ]]; then
    read -rp "Select role for $NAME [PAT/PRO]: " ROLE
    stellar contract invoke \
      --id agent \
      --source-account "$NAME" \
      --network "$NETWORK" \
      -- register_agent --agent "$NAME" --role "$ROLE"
    echo "Registered agent $NAME as $ROLE."
  fi
}

# Delete an agent
do_delete_agent() {
  read -rp "Agent alias to delete: " AGENT
  # 1) On-chain deletion (immediate send)
  stellar contract invoke \
    --id agent \
    --source-account "$AGENT" \
    --network "$NETWORK" \
    -- delete_agent --agent "$AGENT"
  echo "Deleted agent $AGENT on-chain."

  # 2) Local identity cleanup from known locations
  for DIR in \
    "$HOME/.stellar/identity" \
    "$HOME/.config/stellar/identity" \
    "./.stellar/identity";
  do
    ID_FILE="$DIR/${AGENT}.toml"
    if [[ -f "$ID_FILE" ]]; then
      rm -v "$ID_FILE" && echo "Removed local identity file: $ID_FILE"
      return
    fi
  done
  echo "No local identity file found for '$AGENT' in ~/.stellar, ~/.config/stellar, or ./.stellar directories."
}


# Register relationship between patient and provider
do_register_relationship() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  stellar contract invoke \
    --id relationship \
    --source-account "$PAT" \
    --network "$NETWORK" \
    -- register_relationship --patient "$PAT" --provider "$PROV"
  echo "Registered relationship $PAT ↔ $PROV."
}

# Add a record pointer
do_add_record() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  read -rp "Record hash (32-byte hex): " HASH
  stellar contract invoke \
    --id relationship \
    --source-account "$PROV" \
    --network "$NETWORK" \
    -- add_record --patient "$PAT" --provider "$PROV" --record_hash "$HASH"
  echo "Added record $HASH for $PAT ↔ $PROV."
}

# Check access for a record
do_has_access() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  read -rp "Record hash (32-byte hex): " HASH
  stellar contract invoke \
    --id relationship \
    --source-account "$PAT" \
    --network "$NETWORK" \
    -- has_access --patient "$PAT" --provider "$PROV" --record_hash "$HASH"
}

# List all records for a relationship
do_list_records() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  stellar contract invoke \
    --id relationship \
    --source-account "$PAT" \
    --network "$NETWORK" \
    -- list_records --patient "$PAT" --provider "$PROV"
}

# Revoke a relationship
do_revoke_relationship() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  stellar contract invoke \
    --id relationship \
    --source-account "$PAT" \
    --network "$NETWORK" \
    -- revoke_relationship --patient "$PAT" --provider "$PROV"
  echo "Revoked relationship $PAT ↔ $PROV."
}

# Remove a specific record
do_remove_record() {
  read -rp "Patient alias: " PAT
  read -rp "Provider alias: " PROV
  read -rp "Record hash (32-byte hex): " HASH
  stellar contract invoke \
    --id relationship \
    --source-account "$PAT" \
    --network "$NETWORK" \
    -- remove_record --patient "$PAT" --provider "$PROV" --record_hash "$HASH"
  echo "Removed record $HASH for $PAT ↔ $PROV."
}

# Main menu loop
while true; do
  cat <<EOF
Select an action:
 1) Generate & fund identity
 2) Build contracts
 3) Deploy contracts
 4) Delete agent
 5) Register relationship
 6) Add record
 7) Check access
 8) List records
 9) Revoke relationship
10) Remove record
11) Exit
EOF
  read -rp "Enter choice [1-11]: " CHOICE
  case "$CHOICE" in
    1) do_generate ;; 2) do_build ;; 3) do_deploy ;; 4) do_delete_agent ;; 5) do_register_relationship ;; 6) do_add_record ;; 7) do_has_access ;; 8) do_list_records ;; 9) do_revoke_relationship ;; 10) do_remove_record ;; 11) exit 0 ;;
    *) echo "Invalid choice." ;;
  esac
done
