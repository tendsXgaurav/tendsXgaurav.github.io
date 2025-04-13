# AIethic

AIethic is an AI assistant built with ethics at its core, designed to promote responsible AI use and ensure that ethics evolve with technology.

![AIethic](favicon.svg)

## Overview

AIethic is more than just a chatbot—it's a mindful AI assistant that:
- Retains meaningful context across conversations without compromising privacy
- Filters, recalls, and adapts timely, ensuring every reply aligns with user values
- Sets boundaries for responsible AI interaction
- Prioritizes ethical considerations in AI responses

## Features

- **Ethics-First Approach**: Built from the ground up with ethical considerations
- **Context Retention**: Maintains conversational context without privacy compromises
- **Adaptive Responses**: Tailors interactions based on user preferences and values
- **Modern Interface**: Clean, responsive design for seamless user experience
- **Privacy-Focused**: Minimizes data collection and respects user boundaries

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js with Express
- **AI Integration**: OpenAI API, Gradio client
- **Deployment**: GitHub Pages

## Setup

1. Clone this repository
   ```bash
   git clone https://github.com/tendsxgaurav/tendsxgaurav.github.io.git aiethic
   cd aiethic
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` to add your actual OpenRouter API key and other required credentials

4. Run the development server
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Deployment

This site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment workflow:

1. Commits pushed to main branch trigger the deployment process
2. Static assets are built and optimized
3. Content is deployed to GitHub Pages
4. The site becomes available at the configured domain

## Domain Configuration

The site is configured to be deployed at `aiethic.me`. Domain configuration includes:

- Custom domain setup through GitHub Pages
- SSL certification for secure connections
- CNAME record configuration

## Security

This repository follows secure practices:
- Environment variables for all sensitive information
- .gitignore configured to prevent committing sensitive files
- No API keys or secrets in the repository
- Regular dependency updates to prevent vulnerabilities

## License

MIT License - See LICENSE file for details

## Contributing

Contributions to AIethic are welcome! Please feel free to submit a Pull Request.

## Contact

For questions or feedback about AIethic, please open an issue in this repository.

---

Built for a responsible future — blending innovation with integrity.
© 2025 AIethic. All rights reserved.
