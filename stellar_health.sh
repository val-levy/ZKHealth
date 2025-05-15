#!/usr/bin/env bash
set -euo pipefail

# Interactive helper for Stellar Health contracts
# Requirements: Rust, wasm32v1-none target, stellar-cli

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

  echo "Deploying Agent contract..."
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/agent.wasm \
    --source-account "$SOURCE" \
    --network "$NETWORK"
  read -rp "Copy and paste the new Agent contract ID: " AGENT_ID
  stellar contract alias add --overwrite --id "$AGENT_ID" agent

  echo "Deploying Relationship contract..."
  stellar contract deploy \
    --wasm target/wasm32v1-none/release/relationship.wasm \
    --source-account "$SOURCE" \
    --network "$NETWORK"
  read -rp "Copy and paste the new Relationship contract ID: " REL_ID
  stellar contract alias add --overwrite --id "$REL_ID" relationship

  echo "Deployment complete. Aliases 'agent' and 'relationship' set."
}

# Generate and fund a new identity
do_generate() {
  read -rp "Enter new identity name: " NAME
  stellar keys generate "$NAME"
  stellar keys fund "$NAME" --network "$NETWORK"
  echo "Generated and funded '$NAME'."
}

# Register an agent with role PAT or PRO
do_register_agent() {
  read -rp "Agent alias to register: " AGENT
  read -rp "Role for $AGENT [PAT/PRO]: " ROLE
  stellar contract invoke \
    --id agent \
    --source-account "$AGENT" \
    --network "$NETWORK" \
    -- register_agent --agent "$AGENT" --role "$ROLE"
  echo "Registered agent $AGENT as $ROLE."
}

# Register a patient-provider relationship
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

# Add a record under a relationship
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

# Revoke a relationship and clear records
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
 4) Register agent
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
    1) do_generate ;; 2) do_build ;; 3) do_deploy ;; 4) do_register_agent ;; 5) do_register_relationship ;; 6) do_add_record ;; 7) do_has_access ;; 8) do_list_records ;; 9) do_revoke_relationship ;; 10) do_remove_record ;; 11) exit 0 ;;
    *) echo "Invalid choice." ;;
  esac
done
