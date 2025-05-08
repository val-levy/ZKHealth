#!/bin/bash

echo "🔄 Swapping in Move.local.toml..."
cp Move.local.toml Move.toml

echo "🔨 Compiling Move package..."
aptos move compile

# Optional: uncomment the next line to restore the git-safe dummy after building
# git checkout Move.toml

echo "✅ Done."