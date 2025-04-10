#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up SSL for AIethic.me on GitHub Pages${NC}"
echo -e "${YELLOW}Note: GitHub Pages automatically provides SSL certificates through Let's Encrypt${NC}"

# Check if CNAME file exists
if [ ! -f "CNAME" ]; then
  echo -e "${RED}CNAME file not found. Creating it now...${NC}"
  echo "aiethic.me" > CNAME
  echo -e "${GREEN}CNAME file created with 'aiethic.me'${NC}"
else
  echo -e "${GREEN}CNAME file already exists${NC}"
  DOMAIN=$(cat CNAME)
  echo -e "Domain: ${YELLOW}${DOMAIN}${NC}"
fi

# Copy chat_page.html to chat.html if it doesn't exist
if [ ! -f "chat.html" ] && [ -f "chat_page.html" ]; then
  echo -e "${GREEN}Copying chat_page.html to chat.html...${NC}"
  cp chat_page.html chat.html
  echo -e "${GREEN}Created chat.html file${NC}"
elif [ ! -f "chat.html" ]; then
  echo -e "${RED}No chat.html or chat_page.html found. GitHub Pages will return 404 for /chat${NC}"
fi

# Fix links in HTML files to ensure they work with the domain
echo -e "${GREEN}Fixing links in HTML files...${NC}"
for file in *.html; do
  echo -e "Processing ${YELLOW}${file}${NC}"
  # Replace absolute paths in href and src attributes
  sed -i 's|href="/|href="|g' "$file"
  sed -i 's|src="/|src="|g' "$file"
  # Fix favicon link
  sed -i 's|<link rel="icon" href="favicon.ico"|<link rel="icon" href="favicon.ico"|g' "$file"
done

# Create .nojekyll file to disable Jekyll processing
if [ ! -f ".nojekyll" ]; then
  echo -e "${GREEN}Creating .nojekyll file to disable Jekyll processing...${NC}"
  touch .nojekyll
fi

# Commit and push changes
echo -e "${BLUE}Do you want to commit and push these changes to GitHub? (y/n)${NC}"
read -p "" commit_choice

if [[ "$commit_choice" == "y" || "$commit_choice" == "Y" ]]; then
  echo -e "${GREEN}Adding all files...${NC}"
  git add .
  
  echo -e "${GREEN}Committing changes...${NC}"
  git commit -m "Setup for GitHub Pages with SSL"
  
  echo -e "${GREEN}Pushing to GitHub...${NC}"
  git push
  
  echo -e "${GREEN}Changes pushed successfully!${NC}"
  
  echo -e "\n${BLUE}GitHub Pages SSL Configuration:${NC}"
  echo -e "1. Go to your repository on GitHub (https://github.com/YOUR_USERNAME/AIethic)"
  echo -e "2. Navigate to Settings > Pages"
  echo -e "3. Under 'Custom domain', ensure '${YELLOW}aiethic.me${NC}' is entered"
  echo -e "4. Check the box for '${YELLOW}Enforce HTTPS${NC}'"
  echo -e "5. Wait for GitHub to provision the SSL certificate (may take up to 24 hours)"
  
  echo -e "\n${BLUE}DNS Configuration:${NC}"
  echo -e "Ensure your domain has the following DNS records:"
  echo -e "1. A Records pointing to GitHub Pages IP addresses:"
  echo -e "   ${YELLOW}@  185.199.108.153${NC}"
  echo -e "   ${YELLOW}@  185.199.109.153${NC}"
  echo -e "   ${YELLOW}@  185.199.110.153${NC}"
  echo -e "   ${YELLOW}@  185.199.111.153${NC}"
  echo -e "2. CNAME Record:"
  echo -e "   ${YELLOW}www  YOUR_USERNAME.github.io.${NC}"
  
  echo -e "\n${BLUE}Testing SSL:${NC}"
  echo -e "After setup is complete, you can verify your SSL at:"
  echo -e "${YELLOW}https://www.ssllabs.com/ssltest/analyze.html?d=aiethic.me${NC}"
else
  echo -e "${YELLOW}Changes were not pushed to GitHub.${NC}"
  echo -e "Run ${GREEN}git add . && git commit -m \"Setup for GitHub Pages with SSL\" && git push${NC} to push later."
fi

echo -e "\n${GREEN}SSL setup process complete!${NC}"
echo -e "${YELLOW}Remember: GitHub automatically provisions and renews Let's Encrypt certificates for custom domains.${NC}"
