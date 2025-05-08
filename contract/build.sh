#!/bin/bash

echo "🔄 Using Move.local.toml..."
cp Move.local.toml Move.toml

# Ask the user for an action
echo "What do you want to do?"
echo "1) Compile"
echo "2) Test"
echo "3) Publish"
read -p "Enter choice [1-3]: " choice

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
  *)
    echo "❌ Invalid option. Exiting."
    exit 1
    ;;
esac

echo "✅ Done."