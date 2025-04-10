#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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
echo -e "2. Under 'Source', select 'main' branch"
echo -e "3. Click 'Save'"
echo -e "4. Your site will be published at https://${github_username}.github.io/${repo_name}"

echo -e "${GREEN}Setup complete!${NC}"
