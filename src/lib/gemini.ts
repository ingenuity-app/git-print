import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Common commit patterns from GitHub repositories
const commitPatterns = {
  feature: {
    prefix: 'feat',
    templates: [
      'Add {feature} functionality',
      'Implement {feature}',
      'Create new {feature}',
      'WIP: {feature} implementation',
      'READY: {feature} for review'
    ]
  },
  bugfix: {
    prefix: 'fix',
    templates: [
      'Fix {issue} in {component}',
      'Resolve {issue}',
      'Fix bug where {description}',
      'FIXED: {issue} in {component}',
      'TESTED: Fix for {issue}'
    ]
  },
  refactor: {
    prefix: 'refactor',
    templates: [
      'Refactor {component} for better performance',
      'Optimize {component}',
      'Clean up {component} implementation',
      'DONE: Refactor {component}'
    ]
  },
  docs: {
    prefix: 'docs',
    templates: [
      'Update documentation for {component}',
      'Add {component} documentation',
      'Improve {component} docs',
      'RFC: Documentation changes for {component}'
    ]
  },
  test: {
    prefix: 'test',
    templates: [
      'Add tests for {component}',
      'Improve test coverage for {component}',
      'Fix failing tests in {component}',
      'TESTED: New test suite for {component}'
    ]
  },
  chore: {
    prefix: 'chore',
    templates: [
      'Update dependencies',
      'Upgrade {dependency} to {version}',
      'Maintain {component}',
      'TODO: Upgrade {dependency}'
    ]
  },
  style: {
    prefix: 'style',
    templates: [
      'Format {component} code',
      'Update code style in {component}',
      'Apply style guidelines to {component}'
    ]
  },
  perf: {
    prefix: 'perf',
    templates: [
      'Improve performance in {component}',
      'Optimize {component} for better speed',
      'Performance enhancements for {component}'
    ]
  },
  ci: {
    prefix: 'ci',
    templates: [
      'Update CI pipeline',
      'Add new CI workflow for {component}',
      'Fix CI tests for {component}'
    ]
  }
};

function categorizeCommit(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced pattern detection
  if (lowerMessage.includes('fix') || lowerMessage.includes('bug') || lowerMessage.includes('issue') || lowerMessage.includes('fixed')) {
    return 'bugfix';
  }
  if (lowerMessage.includes('add') || lowerMessage.includes('new') || lowerMessage.includes('feat')) {
    return 'feature';
  }
  if (lowerMessage.includes('refactor') || lowerMessage.includes('improve') || lowerMessage.includes('optimize')) {
    return 'refactor';
  }
  if (lowerMessage.includes('doc') || lowerMessage.includes('readme') || lowerMessage.includes('rfc')) {
    return 'docs';
  }
  if (lowerMessage.includes('test') || lowerMessage.includes('tested')) {
    return 'test';
  }
  if (lowerMessage.includes('style') || lowerMessage.includes('format')) {
    return 'style';
  }
  if (lowerMessage.includes('perf') || lowerMessage.includes('performance')) {
    return 'perf';
  }
  if (lowerMessage.includes('ci') || lowerMessage.includes('pipeline')) {
    return 'ci';
  }
  return 'chore';
}

function extractKeyComponents(message: string): { component?: string; description?: string } {
  const words = message.split(' ');
  const components = new Set([
    'api', 'ui', 'database', 'auth', 'core', 'utils', 'config', 
    'tests', 'docs', 'ci', 'build', 'deploy', 'pipeline',
    'frontend', 'backend', 'middleware', 'models', 'views',
    'controllers', 'services', 'helpers', 'lib'
  ]);
  
  const component = words.find(word => components.has(word.toLowerCase()));
  const description = message.replace(component || '', '').trim();
  
  return { component, description };
}

function extractIssueNumber(message: string): number {
  const patterns = [
    /(?:fix|fixes|fixed|close|closes|closed|resolve|resolves|resolved)\s+#?(\d+)/i,
    /(?:issue|bug|feature|task)\s+#?(\d+)/i,
    /#(\d+)/
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }

  const hash = message.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
  }, 0);
  
  return Math.abs(hash % 999) + 1;
}

export async function improveCommitMessage(originalMessage: string): Promise<string> {
  // Check if API key is configured
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const issueNumber = extractIssueNumber(originalMessage);
  const category = categorizeCommit(originalMessage);
  const { component, description } = extractKeyComponents(originalMessage);
  const pattern = commitPatterns[category as keyof typeof commitPatterns];

  const prompt = `As a Git commit message expert, improve this commit message using standard conventions and these status indicators:

Common Prefixes:
- WIP: Work in Progress
- DONE: Task completed
- FIXED: Issue resolved
- BLOCKED: Waiting for dependency
- READY: Ready for review
- TESTED: Successfully tested
- RFC: Request for Comments
- TODO: Planned task

Original message: "${originalMessage}"
Detected category: ${category}
Component: ${component || 'unknown'}
Issue number: #${issueNumber}

Use this format:
${pattern.prefix}(${component || 'scope'}): Brief summary (#${issueNumber})

Guidelines:
- Use appropriate status prefix if needed (WIP, DONE, etc.)
- Keep first line under 72 characters
- Use imperative mood ("Add" not "Added")
- Reference any related issues
- Include breaking changes warning if applicable

Example good commits:
WIP: feat(auth): Implement OAuth2 social login (#123)
TESTED: fix(api): Resolve rate limiting bypass (#456)
READY: docs(readme): Update deployment instructions (#789)

Return ONLY the improved commit message without any markdown formatting or additional text.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Clean up any markdown formatting
    return response.text()
      .replace(/```\w*\n?/g, '') // Remove code block markers
      .replace(/`/g, '')         // Remove inline code markers
      .trim();                   // Remove extra whitespace
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Provide user-friendly error messages for common issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key configuration.');
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('Failed to improve commit message. Please try again.');
    }
  }
}
