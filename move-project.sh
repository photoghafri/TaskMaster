#!/bin/bash

# This script helps move the project from an external drive to a local drive
# Run this script with: bash move-project.sh

echo "Moving project to local drive..."

# Set destination directory in home folder
DEST_DIR="$HOME/project-management-app"

# Create destination directory if it doesn't exist
mkdir -p "$DEST_DIR"

# Copy project files (excluding node_modules and .next)
echo "Copying project files to $DEST_DIR..."
rsync -av --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude 'package-lock.json' \
  ./ "$DEST_DIR/"

echo "Project files copied to $DEST_DIR"
echo ""
echo "Next steps:"
echo "1. cd $DEST_DIR"
echo "2. npm install"
echo "3. npm run dev"
echo ""
echo "This will set up your project in a location with better file permissions." 