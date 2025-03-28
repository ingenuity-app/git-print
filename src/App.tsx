import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Loader2, Copy, Sparkles } from 'lucide-react';
import { improveCommitMessage } from './lib/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

// themes: water as highest good, finding low places, grace without force
// visualization: ASCII characters flow like water, seeking their natural level without effort

// Custom hook for requestAnimationFrame
const useAnimationFrame = (callback: (deltaTime: number) => void, isRunning = true) => {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  
  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);
  
  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      previousTimeRef.current = null;
    };
  }, [animate, isRunning]);
};

const WaterAscii: React.FC = () => {
  const [frame, setFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const characters = '~≈≋⋿⊰⊱◟◝';
  const rows = 25;
  const cols = 52;
  
  const centerPos = { x: 0.5, y: 0.5 };
  const charactersLength = characters.length;
  const charLengthDivide4 = charactersLength / 4;
  const piTimes2 = Math.PI * 2;
  
  const lastUpdateRef = useRef<number>(0);

  const updateAnimation = useCallback((deltaTime: number) => {
    lastUpdateRef.current += deltaTime;
    if (lastUpdateRef.current > 166) {
      setFrame(f => f + 1);
      lastUpdateRef.current = 0;
    }
  }, []);

  useAnimationFrame(updateAnimation);

  useEffect(() => {
    return () => {
      lastUpdateRef.current = 0;
    };
  }, []);

  const generateAscii = useCallback(() => {
    const rowsArray = [];
    const frameDiv4 = frame / 6.7;
    const frameDiv5 = frame / 8.3;
    const frameDiv8 = frame / 13.3;
    
    for (let y = 0; y < rows; y++) {
      const yDivRows = y / rows;
      const yDiv5 = y / 5;
      const yDiv3 = y / 3;
      let rowString = '';
      let rowOpacity = 1;
      
      for (let x = 0; x < cols; x++) {
        const xDivCols = x / cols;
        const xDiv3 = x / 3;
        const xDiv4 = x / 4;
        
        const dx = xDivCols - centerPos.x;
        const dy = yDivRows - centerPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const distTimes10 = dist * 10;
        const distTimes5 = dist * 5;

        const wave = Math.sin(xDiv3 + yDiv5 + frameDiv4 + distTimes10) + 
                    Math.cos(xDiv4 - yDiv3 - frameDiv5) +
                    Math.sin(frameDiv8 + xDivCols * piTimes2);

        const charValue = (wave + 2) * charLengthDivide4 + distTimes5;
        const charIndex = Math.floor(Math.abs(charValue)) % charactersLength;
        
        const opacity = Math.max(0.2, Math.min(0.8, 1 - dist + Math.sin(wave) / 3));
        
        if (x === 0) rowOpacity = opacity;
        else rowOpacity = (rowOpacity + opacity) / 2;
        
        rowString += characters[charIndex];
      }
      
      rowsArray.push({ text: rowString, opacity: rowOpacity });
    }
    return rowsArray;
  }, [frame, rows, cols, charactersLength, charLengthDivide4, piTimes2, centerPos.x, centerPos.y, characters]);

  const ascii = useMemo(() => generateAscii(), [generateAscii]);

  const containerStyle = useMemo(() => ({ 
    margin: 0,
    background: '#F0EEE6',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  }), []);

  const innerContainerStyle = useMemo(() => ({
    padding: '30px',
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }), []);

  const preStyle = useMemo(() => ({
    fontFamily: 'monospace',
    fontSize: '10px',
    lineHeight: '1',
    cursor: 'default',
    userSelect: 'none' as const,
    margin: 0,
    padding: '20px'
  }), []);

  return (
    <div style={containerStyle}>
      <div 
        ref={containerRef}
        style={innerContainerStyle}
      >
        <pre style={preStyle}>
          {ascii.map((row, i) => (
            <div 
              key={i} 
              style={{ 
                opacity: row.opacity, 
                margin: 0,
                lineHeight: '1' 
              }}
            >
              {row.text}
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};

function App() {
  const [originalMessage, setOriginalMessage] = useState('');
  const [improvedMessage, setImprovedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImprove = async () => {
    if (!originalMessage.trim()) {
      setError('Please enter a commit message');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const improved = await improveCommitMessage(originalMessage);
      setImprovedMessage(improved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to improve commit message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (improvedMessage) {
      try {
        await navigator.clipboard.writeText(improvedMessage);
        console.log('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      const isMac = navigator.userAgent.includes('Mac');
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        if (!isLoading) {
          handleImprove();
        }
      }

      if (cmdOrCtrl && e.key === 'c' && improvedMessage) {
        e.preventDefault();
        copyToClipboard();
      }

      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        focusTextarea();
      }

      if (e.key === 'Escape' && error) {
        e.preventDefault();
        setError('');
      }

      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(!showShortcuts);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, improvedMessage, error, showShortcuts]);

  return (
    <div className="min-h-screen flex flex-col bg-cream relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <WaterAscii />
      </div>
      <main className="flex-1 flex flex-col relative z-10">
        <header className="text-center mt-10 mb-8">
          <h1 className="text-2xl font-display font-semibold text-gray-800 mb-1 tracking-tight">
            <span className="text-ingenuity-red">Git Print</span>
          </h1>
          <p className="text-sm text-gray-500 tracking-wide">
            Transform commit messages with AI precision
          </p>
        </header>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-lg bg-white/40 backdrop-blur-lg border border-white/30 shadow-xl rounded-full p-2 flex flex-col gap-2 transition-all duration-300 my-6">
            <div className="flex items-center justify-between mb-0 px-4 pt-1">
              <label 
                htmlFor="original" 
                className="text-xs font-medium text-gray-500 uppercase tracking-widest"
              >
                Original Message
              </label>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="text-xs text-gray-400 hover:text-ingenuity-red transition-colors"
              >
                ⌘/ shortcuts
              </button>
            </div>
            <textarea
              ref={textareaRef}
              id="original"
              rows={1}
              className="w-full rounded-full bg-white/20 border-none text-gray-900 placeholder-gray-400 px-4 py-2 font-mono text-base leading-tight focus:outline-none focus:ring-2 focus:ring-ingenuity-red/30 transition-all resize-none shadow-none backdrop-blur-lg"
              placeholder="Enter your commit message here..."
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
              onKeyDown={(e) => {
                const isMac = navigator.userAgent.includes('Mac');
                const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
                if (cmdOrCtrl && e.key === 'Enter') {
                  e.preventDefault();
                  if (!isLoading) {
                    handleImprove();
                  }
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-1">
              <span className="text-xs text-gray-400 font-mono">{originalMessage.length} / 72</span>
              <button
                onClick={handleImprove}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-1.5 bg-ingenuity-red text-white font-normal rounded-full transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-none tracking-wide focus:outline-none focus:ring-2 focus:ring-ingenuity-red/20"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 flex space-x-1">
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    Improving...
                  </>
                ) : (
                  <>
                    {/* Checkered SVG icon */}
                    <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="7" width="4" height="4" fill="#C0C0C0" />
                      <rect x="9" y="7" width="4" height="4" fill="#C0C0C0" />
                      <rect x="15" y="7" width="4" height="4" fill="#C0C0C0" />
                      <rect x="6" y="13" width="4" height="4" fill="#C0C0C0" />
                      <rect x="12" y="13" width="4" height="4" fill="#C0C0C0" />
                    </svg>
                    Improve
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-1 flex items-center justify-center gap-2 text-red-600 text-xs bg-red-50/80 backdrop-blur-sm p-3 rounded-full border border-red-200/60 shadow-sm mx-auto w-fit">
                <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>
        </div>
        <div className="w-full max-w-xl mx-auto px-3">
          {showShortcuts && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/60 p-3 shadow-sm">
              <h3 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-widest">
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Improve message:</span>
                  <kbd className="px-1 py-0.5 bg-gray-100/80 border border-gray-200 rounded text-gray-600">
                    ⌘ Enter
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Copy result:</span>
                  <kbd className="px-1 py-0.5 bg-gray-100/80 border border-gray-200 rounded text-gray-600">
                    ⌘ C
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Focus textarea:</span>
                  <kbd className="px-1 py-0.5 bg-gray-100/80 border border-gray-200 rounded text-gray-600">
                    ⌘ K
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Clear error:</span>
                  <kbd className="px-1 py-0.5 bg-gray-100/80 border border-gray-200 rounded text-gray-600">
                    Esc
                  </kbd>
                </div>
              </div>
            </div>
          )}
          {improvedMessage && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/60 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                  Improved Message
                </label>
                <button
                  onClick={copyToClipboard}
                  className="p-0.5 text-gray-400 hover:text-ingenuity-red bg-gray-100/50 rounded border border-gray-200/50 transition-colors"
                  title="Copy to clipboard (⌘C)"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="rounded-md bg-gray-50/30 border-0 p-2.5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  className="prose max-w-none text-gray-900 selectable-text prose-sm"
                >
                  {improvedMessage}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-auto pb-8 text-center relative z-10">
        <div className="border-t border-gray-200/40 pt-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="text-gray-500 text-sm max-w-md leading-relaxed">
              Built with care for developers who believe in the power of thoughtful collaboration. 
              Every commit tells a story, and every story matters.
            </div>
            <div className="flex items-center justify-center space-x-4">
              <a 
                href="https://github.com/ingenuity-app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-ingenuity-red transition-colors text-xs font-medium"
              >
                GitHub
              </a>
              <span className="text-gray-300">•</span>
              <a 
                href="https://github.com/orgs/ingenuity-app/discussions" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-ingenuity-red transition-colors text-xs font-medium"
              >
                Community
              </a>
            </div>
            <div className="text-gray-400 text-xs tracking-wide">
              © {new Date().getFullYear()} Git Print by Ingenuity. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
