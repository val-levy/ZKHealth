#!/bin/bash

# Step 1: Check for prerequisites
check_and_install() {
  local cmd=$1
  local install_cmd=$2
  echo "🔍 Checking for $cmd..."
  if ! command -v $cmd &> /dev/null; then
    echo "⚠️  $cmd not found. Installing..."
    eval $install_cmd
  else
    echo "✅ $cmd is already installed."
  fi
}

# Check for Python
check_and_install "python3" "brew install python"

# Check for Node.js
check_and_install "node" "brew install node"

# Check for Aptos CLI
check_and_install "aptos" "brew install aptos"

# Step 2: Create virtual environment and install requirements
echo "🔄 Setting up Python virtual environment..."
if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo "✅ Virtual environment created."
else
  echo "✅ Virtual environment already exists."
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "🔄 Installing Python dependencies..."
if [ -f "../requirements.txt" ]; then
  pip install -r ../requirements.txt
  echo "✅ Python dependencies installed."
else
  echo "⚠️  requirements.txt not found in ../. Skipping dependency installation."
fi

deactivate

# Step 3: Initialize Aptos CLI if .aptos/config.yaml is missing
echo "🔄 Checking for Aptos CLI configuration..."
if [ ! -f ~/.aptos/config.yaml ]; then
  echo "⚠️  Aptos CLI configuration not found. Initializing Aptos CLI..."
  aptos init --assume-yes --rest-url https://fullnode.devnet.aptoslabs.com/v1 --faucet-url https://faucet.devnet.aptoslabs.com
fi

# Step 4: Check for Move.local.toml and create it if missing
#####fi

# Step 5: Use Move.local.toml
#echo "🔄 Using Move.local.toml..."
#cp Move.local.toml Move.toml

# Step 6: Ask the user for an action
echo "What do you want to do?"
echo "1) Compile"
echo "2) Test"
echo "3) Publish"
echo "4) Create Agent"
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo "🔨 Compiling..."
    aptos move compile
    ;;
  2)
    echo "🧪 Running tests..."
    aptos move test
    ;;
  3)
    echo "🚀 Publishing to Aptos..."
    aptos move publish --profile default
    ;;
  4)
    # Step 7: Add user input for profile name and agent type
    read -p "Enter the profile name (e.g., patient, provider): " profile_name
    read -p "Is this a patient or provider? (Enter 0 for patient, 1 for provider): " agent_type

    # Validate agent type
    if [[ "$agent_type" != "0" && "$agent_type" != "1" ]]; then
      echo "❌ Invalid agent type. Please enter 0 for patient or 1 for provider."
      exit 1
    fi

    # Create the account and fund it
    echo "🔄 Creating Aptos account for profile: $profile_name..."
    aptos init --profile $profile_name --assume-yes --network custom --rest-url https://fullnode.devnet.aptoslabs.com/v1 --faucet-url https://faucet.devnet.aptoslabs.com

    echo "🔄 Funding account for profile: $profile_name..."
    aptos account fund-with-faucet --profile $profile_name

    # Get the account address from the Aptos CLI configuration file
    echo "🔄 Retrieving account address for profile: $profile_name..."
    profile_address=$(aptos config show-profiles | grep -A 5 "$profile_name" | grep "account" | awk '{print "0x"$2}' | tr -d '"',',')

    # Validate that the profile_address is not empty
    if [ -z "$profile_address" ]; then
      echo "❌ Error: Failed to retrieve the account address for profile $profile_name."
      exit 1
    fi
    
    # Publish the Move package under the new account
    echo "🔄 Publishing Move package for profile: $profile_name..."
    aptos move publish --profile $profile_name

    echo "✅ Move package published for profile: $profile_name."
    # Generate a .env file for the profile in the env folder
    env_file="/Users/finnfujimura/Desktop/MedRec/env/$profile_name.env"
    echo "🔄 Generating .env file for profile: $profile_name..."
    cat <<EOL > $env_file
NEXT_MODULE_PUBLISHER_ACCOUNT_ADDRESS=$profile_address
NEXT_MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=$(cat ~/.aptos/config.yaml | grep -A 2 "$profile_name" | grep "private_key" | awk '{print $2}')
EOL

    echo "✅ .env file created at $env_file"

    # Update Move.local.toml with the selected profile's address
    echo "🔄 Updating Move.toml with the profile address..."
    sed -i '' "s/medrec_addr = .*/medrec_addr = \"$profile_address\"/" /Users/finnfujimura/Desktop/MedRec/contract/Move.toml

    echo "✅ Move.toml updated with medrec_addr = $profile_address"

    # Label the account as an agent
    echo "🔄 Labeling account as agent type $agent_type (0 = patient, 1 = provider)..."
    if [ -z "$profile_address" ]; then
      echo "❌ Error: Profile address is empty. Ensure the account was created successfully."
      exit 1
    fi

    aptos move run \
      --function-id "${profile_address}::Agent::create_agent" \
      --args u8:$agent_type \
      --profile $profile_name

    echo "✅ Account setup complete for profile: $profile_name as $(if [ "$agent_type" -eq "0" ]; then echo "patient"; else echo "provider"; fi)."
    ;;
esac

echo "✅ Done."