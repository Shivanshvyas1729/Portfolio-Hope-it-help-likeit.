#!/bin/bash

# Get the latest commit message
COMMIT_MSG=$(git log -1 --pretty=%B)

# Check if it contains [skip ci]
if [[ "$COMMIT_MSG" == *"[skip ci]"* ]]; then
  echo "Detected [skip ci] in commit message. Skipping build."
  exit 0
else
  echo "Proceeding with build."
  exit 1
fi
