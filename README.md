# Git Print

We are unlocking the power of AI-enhanced Git workflows. Git Print is now accessible to developers, teams, and organizations of all sizes so that they can create better commit messages, improve collaboration, and maintain consistent Git practices responsibly.

This release includes a complete web application with AI-powered commit message enhancement, keyboard shortcuts, and a beautiful minimalist interface — designed to transform how developers write commit messages.

This repository is intended as a minimal example to demonstrate Git Print functionality and run the web application locally. For more detailed examples and integrations, see the documentation.

## Updates post-launch

See UPDATES.md. Also for a running list of frequently asked questions, see here.

## Download

In order to download and run Git Print locally, please visit the repository and clone it to your local machine.

Once you have cloned the repository, you will need to set up your environment variables and install dependencies. Then run the development server to start the application.

Pre-requisites: Make sure you have Node.js 18+ and npm installed. Then run the setup script: `npm install`.

Keep in mind that you need a valid Google Gemini API key to use the AI functionality. If you start seeing errors such as "API Error", you can always check your API key configuration.

## Access to Google Gemini AI

We are using Google's Gemini AI for commit message enhancement. You can request access to the Gemini API by visiting the Google AI Studio and creating an API key. After doing so, you should get access to the Gemini models within a few minutes.

## Quick Start

You can follow the steps below to quickly get up and running with Git Print. These steps will let you run the web application locally. For more examples, see the documentation.

In a terminal with Node.js / npm available clone and download this repository.

In the top-level directory run:

```bash
npm install
```

Visit the Google AI Studio and register to get your Gemini API key.

Once registered, you will get an API key that you need to add to your `.env` file.

Once you have your API key, navigate to your downloaded git-print repository and create a `.env` file:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Make sure to add the `.env` file to your `.gitignore` to keep your API key secure.

Once your environment is set up, you can run the application locally using the command below:

```bash
npm run dev
```

**Note**

- Replace `your_gemini_api_key_here` with your actual Gemini API key.
- The development server will run on `http://localhost:3000` by default.
- You can adjust the port in `vite.config.ts` if needed.
- This example runs the development server found in this repository but you can change that to a different command.

## Usage

Different commit message types are supported with different prefixes:

| Type | Prefix | Description |
|------|--------|-------------|
| feat | feat | New features |
| fix | fix | Bug fixes |
| docs | docs | Documentation changes |
| refactor | refactor | Code refactoring |
| test | test | Test additions |
| chore | chore | Maintenance tasks |
| style | style | Code style changes |
| perf | perf | Performance improvements |
| ci | ci | CI/CD changes |

All models support commit messages up to 72 characters for the first line, but we recommend keeping them concise and clear. So set your messages according to your project's conventions.

## Basic Usage

These features are designed for simple commit message enhancement. They should be used so that the expected output is a properly formatted conventional commit message.

See the web interface for some examples. To illustrate, see the command below to run the development server:

```bash
npm run dev
```

## AI-Enhanced Features

The AI-enhanced features were trained for commit message improvement applications. To get the expected features and performance, a specific formatting defined in the Gemini integration needs to be followed, including conventional commit prefixes, issue references, and status indicators.

You can also deploy additional validation for filtering out inputs and outputs that are deemed inappropriate. See the documentation for examples of how to add a safety checker to the inputs and outputs of your application.

Examples using the web interface:

1. Enter a commit message like "fix login bug"
2. Click "Improve" or press ⌘+Enter
3. Get output like "fix(auth): Resolve login authentication bypass (#123)"

Git Print is a new technology that carries potential risks with use. Testing conducted to date has not — and could not — cover all scenarios. In order to help developers address these risks, we have created the Responsible Use Guide. More details can be found in our documentation as well.

## Issues

Please report any software "bug", or other problems with the application through one of the following means:

- Reporting issues with the application: github.com/ingenuity-app/git-print
- Reporting bugs and security concerns: github.com/ingenuity-app/git-print/security
- General questions and support: github.com/ingenuity-app/git-print/discussions

## Model Card

See MODEL_CARD.md.

## License

Our application and code are licensed for both developers and commercial entities, upholding the principles of openness. Our mission is to empower individuals and teams through this opportunity, while fostering an environment of discovery and ethical AI advancements.

See the LICENSE file, as well as our accompanying Acceptable Use Policy.

## References

- Research Paper: Conventional Commits specification
- Git Print technical overview
- Open Innovation AI Research Community

For common questions, the FAQ can be found here which will be kept up to date over time as new questions arise.

## Original Git Print

The repo for the original git-print release is in the main branch.
