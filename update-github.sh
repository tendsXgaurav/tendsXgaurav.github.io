#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Updating AIethic site on GitHub...${NC}"

# Commit and push changes
echo -e "${GREEN}Adding all changes...${NC}"
git add .

echo -e "${GREEN}Committing changes...${NC}"
git commit -m "Fix website URL and chat page"

echo -e "${GREEN}Pushing to GitHub...${NC}"
git push

echo -e "${GREEN}Changes pushed to GitHub!${NC}"
echo -e "${BLUE}Notes for custom domain (aiethic.me):${NC}"
echo -e "1. Make sure you've set up the correct DNS records:"
echo -e "   - Type: A, Name: @, Value: 185.199.108.153"
echo -e "   - Type: A, Name: @, Value: 185.199.109.153"
echo -e "   - Type: A, Name: @, Value: 185.199.110.153"
echo -e "   - Type: A, Name: @, Value: 185.199.111.153"
echo -e "   - Type: CNAME, Name: www, Value: your-username.github.io."
echo -e "2. In your GitHub repository settings, under Pages:"
echo -e "   - Ensure 'Custom domain' is set to 'aiethic.me'"
echo -e "   - Check 'Enforce HTTPS' once DNS propagation is complete"
echo -e "${BLUE}It may take up to 24 hours for DNS changes to propagate.${NC}"
