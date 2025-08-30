#!/bin/bash
cd "/Users/dustin/Desktop/Filter Switch"

# Add all changes
git add .

# Commit with message
git commit -m "feat: add external API server for site management

- Created Express.js server with REST API endpoints
- Added create site endpoint that returns PHP code
- Implemented CRUD operations for sites
- Added authentication via API key
- Integrated with Firebase Realtime Database
- Removed Firebase Functions in favor of standalone server

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push origin main

echo "Git push completed!"