#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up AIethic on GitHub...${NC}"

# Initialize Git repository if not already initialized
if [ ! -d .git ]; then
  echo -e "${GREEN}Initializing Git repository...${NC}"
  git init
else
  echo -e "${GREEN}Git repository already initialized.${NC}"
fi

# Ask for GitHub username
read -p "Enter your GitHub username: " github_username

# Ask for repository name
read -p "Enter repository name (default: AIethic): " repo_name
repo_name=${repo_name:-AIethic}

# Create .gitignore file
echo -e "${GREEN}Creating .gitignore file...${NC}"
cat > .gitignore << EOL
# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Editor directories and files
.idea
.vscode
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
EOL

# Ensure we have an index.html file (GitHub Pages requires this)
if [ ! -f "index.html" ] && [ -f "home_page.html" ]; then
  echo -e "${GREEN}Copying home_page.html to index.html for GitHub Pages...${NC}"
  cp home_page.html index.html
  
  # Fix favicon path and other absolute paths for GitHub Pages
  echo -e "${GREEN}Fixing paths for GitHub Pages...${NC}"
  sed -i 's|/favicon.ico|favicon.ico|g' index.html
  sed -i 's|/chat|chat|g' index.html
  
  echo -e "${GREEN}Created index.html file${NC}"
elif [ ! -f "index.html" ]; then
  echo -e "${RED}Error: No index.html or home_page.html found!${NC}"
  echo -e "${RED}GitHub Pages requires an index.html file in the root directory.${NC}"
  exit 1
fi

# Create .nojekyll file to disable Jekyll processing
echo -e "${GREEN}Creating .nojekyll file to disable Jekyll processing...${NC}"
touch .nojekyll

# Create README.md
echo -e "${GREEN}Creating README.md file...${NC}"
cat > README.md << EOL
# AIethic

A responsible AI platform built with ethics at its core.

## Description

AIethic is more than just a chatbot - it's an AI built with ethics at its core, promoting responsible AI use.

## Features

- Ethical AI interactions
- Mindful conversations
- Privacy-focused design

## Live Demo

Visit the [live site](https://${github_username}.github.io/${repo_name})
EOL

# Add all files
echo -e "${GREEN}Adding files to Git...${NC}"
git add .

# Commit changes
echo -e "${GREEN}Committing files...${NC}"
git commit -m "Initial commit of AIethic site"

# Create repository on GitHub via browser instruction
echo -e "${BLUE}Now you need to create a new repository on GitHub:${NC}"
echo -e "1. Go to https://github.com/new"
echo -e "2. Name your repository: ${repo_name}"
echo -e "3. Do NOT initialize with README, .gitignore, or license"
echo -e "4. Click 'Create repository'"
echo -e "${BLUE}After creating the repository, come back here and press Enter to continue...${NC}"
read -p ""

# Add remote origin
echo -e "${GREEN}Adding remote origin...${NC}"
git remote add origin https://github.com/${github_username}/${repo_name}.git

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git branch -M main
git push -u origin main

# Instructions for GitHub Pages
echo -e "${BLUE}To publish your site using GitHub Pages:${NC}"
echo -e "1. Go to https://github.com/${github_username}/${repo_name}/settings/pages"
echo -e "2. Under 'Source', select 'Deploy from a branch'"
echo -e "3. Under 'Branch', select 'main' and '/ (root)'"
echo -e "4. Click 'Save'"
echo -e "5. Wait a few minutes for deployment to complete"
echo -e "6. Your site will be published at https://${github_username}.github.io/${repo_name}"
echo -e "${BLUE}Note: It may take up to 10 minutes for changes to be published after pushing to GitHub${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Troubleshooting tips:${NC}"
echo -e "1. Make sure your repository is public"
echo -e "2. Check if index.html exists in the root of your repository"
echo -e "3. Visit the Actions tab on GitHub to see if there are any deployment errors"
echo -e "4. If your site still shows 'File not found', try adding and committing a small change to trigger a new deployment:"
echo -e "   git commit --allow-empty -m 'Trigger rebuild' && git push"

# Execute the update now
echo -e "${BLUE}Would you like to push your updated files to GitHub now? (y/n)${NC}"
read -p "" push_now

if [[ "$push_now" == "y" || "$push_now" == "Y" ]]; then
  echo -e "${GREEN}Adding all files...${NC}"
  git add .
  
  echo -e "${GREEN}Committing changes...${NC}"
  git commit -m "Fix GitHub Pages deployment: Add index.html and fix paths"
  
  echo -e "${GREEN}Pushing to GitHub...${NC}"
  git push origin main
  
  echo -e "${GREEN}Update pushed successfully!${NC}"
  echo -e "${BLUE}Your site should be live at https://${github_username}.github.io/${repo_name} shortly.${NC}"
else
  echo -e "${BLUE}You can push your changes later with: git add . && git commit -m 'Update website' && git push${NC}"
fi
