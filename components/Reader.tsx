import React, { useState, useEffect, useRef } from 'react';
import { BookSection } from '../types';
import { Copy, Check, Bookmark, Quote, Volume2, Play, Pause, Square, X } from 'lucide-react';

interface ReaderProps {
  section: BookSection;
  fontSizeClass: string;
  chapterTitle?: string;
  currentSectionIndex?: number;
  totalSections?: number;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const Reader: React.FC<ReaderProps> = ({ 
  section, 
  fontSizeClass, 
  chapterTitle,
  currentSectionIndex = 0,
  totalSections = 1,
  isBookmarked = false,
  onToggleBookmark
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  // Audio State
  const [showPlayer, setShowPlayer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize synth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    
    // Cleanup on unmount or section change
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Stop audio when section changes
  useEffect(() => {
    handleStop();
    setShowPlayer(false);
  }, [section.id]);

  const extractText = () => {
    let text = `${section.title}. \n\n`;
    section.content.forEach(block => {
      if (typeof block === 'string') {
        text += `${block} \n`;
      } else if (block.type === 'header') {
        text += `${block.text}. \n`;
      } else if (block.type === 'list') {
        block.items.forEach(item => text += `${item}. \n`);
      } else if (block.type === 'quote') {
        text += `${block.text}. \n`;
      } else if (block.type === 'footnote') {
        // Skip footnotes for smoother reading flow or include them if preferred
        // text += `Сноска: ${block.text}. \n`; 
      }
    });
    return text;
  };

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    const text = extractText();
    if (!text) return;

    // Cancel previous speech to avoid queueing
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Calculate progress
    // Note: charIndex is not perfectly reliable in all browsers, but it's the standard way
    utterance.onboundary = (event) => {
      if (event.name === 'word' || event.name === 'sentence') {
        const charIndex = event.charIndex;
        // Ensure valid calculation
        const len = text.length > 0 ? text.length : 1;
        const percentage = (charIndex / len) * 100;
        setProgress(Math.min(percentage, 100));
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      utteranceRef.current = null;
    };

    utterance.onerror = (e) => {
      // Ignore errors caused by canceling or interrupting playback
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      console.error("Speech synthesis error:", e.error);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    utteranceRef.current = null;
  };

  const handleCopy = async () => {
    const text = extractText();
    try {
      await navigator.clipboard.writeText(text.trim());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 lg:py-16 w-full overflow-hidden">
      {/* Chapter Progress Indicator */}
      {chapterTitle && (
        <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {chapterTitle}
            </span>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {currentSectionIndex + 1} из {totalSections}
            </span>
          </div>
          <div className="flex gap-1 h-1 w-full rounded-full overflow-hidden">
            {Array.from({ length: totalSections }).map((_, i) => (
              <div
                key={i}
                className={`h-full flex-1 transition-all duration-300 rounded-full ${
                  i <= currentSectionIndex
                    ? 'bg-primary-500 dark:bg-primary-400'
                    : 'bg-gray-200 dark:bg-gray-700'
                } ${i < currentSectionIndex ? 'opacity-60' : 'opacity-100'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 break-words hyphens-auto transition-colors flex-1">
          {section.title}
        </h1>
        <div className="flex gap-2 shrink-0 mt-1">
          <button
            onClick={() => setShowPlayer(!showPlayer)}
            className={`p-2.5 rounded-xl transition-all ${
              showPlayer 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/30'
            }`}
            aria-label="Слушать"
            title="Слушать текст"
          >
            <Volume2 size={20} />
          </button>
          
          {onToggleBookmark && (
            <button
              onClick={onToggleBookmark}
              className={`p-2.5 rounded-xl transition-all ${
                isBookmarked 
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                  : 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/30'
              }`}
              aria-label={isBookmarked ? "Убрать закладку" : "Добавить закладку"}
              title={isBookmarked ? "Убрать закладку" : "Добавить закладку"}
            >
              <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-2.5 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 bg-gray-50 dark:bg-gray-800/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-all"
            aria-label="Копировать текст раздела"
            title="Копировать текст"
          >
            {isCopied ? <Check size={20} className="text-green-500 dark:text-green-400" /> : <Copy size={20} />}
          </button>
        </div>
      </div>

      {/* Audio Player Panel */}
      {showPlayer && (
        <div className="mb-10 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/30"
                aria-label={isPlaying ? "Пауза" : "Воспроизвести"}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>
              <button
                onClick={handleStop}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                aria-label="Стоп"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1.5 flex justify-between">
                <span>Чтение вслух</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full">
                <div 
                  className="h-full bg-primary-500 transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button 
              onClick={() => {
                handleStop();
                setShowPlayer(false);
              }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      <div className={`prose prose-slate dark:prose-invert ${fontSizeClass} max-w-none w-full font-serif text-gray-800 dark:text-gray-300 leading-relaxed transition-all duration-200 break-words hyphens-auto`}>
        {section.content.map((block, index) => {
          if (typeof block === 'string') {
            return <p key={index} className="mb-6 indent-4 lg:indent-6 text-justify">{block}</p>;
          }
          
          if (block.type === 'header') {
            return <h3 key={index} className="font-sans font-semibold text-primary-800 dark:text-primary-300 mt-10 mb-4 break-words">{block.text}</h3>;
          }
          
          if (block.type === 'list') {
            return (
              <ul key={index} className="list-disc pl-6 mb-6 space-y-2 marker:text-primary-500 dark:marker:text-primary-400">
                {block.items.map((item, i) => (
                  <li key={i} className="pl-1">{item}</li>
                ))}
              </ul>
            );
          }
          
          if (block.type === 'quote') {
            return (
              <figure key={index} className="relative my-10 pl-6 pr-6 py-6 border-l-4 border-primary-500 dark:border-primary-400 bg-gray-50 dark:bg-gray-800/40 rounded-r-xl overflow-hidden">
                <div className="absolute top-2 left-2 opacity-5 text-primary-900 dark:text-primary-100 pointer-events-none">
                   <Quote size={40} />
                </div>
                <blockquote className="relative z-10 italic text-gray-700 dark:text-gray-200">
                  <p className="mb-2 leading-loose">{block.text}</p>
                </blockquote>
                {block.source && (
                   <figcaption className="relative z-10 mt-3 flex items-center justify-end gap-2">
                     <span className="h-px w-6 bg-primary-300 dark:bg-primary-700"></span>
                     <cite className="text-sm font-sans font-semibold text-primary-700 dark:text-primary-400 not-italic tracking-wide">
                       {block.source}
                     </cite>
                   </figcaption>
                 )}
              </figure>
            );
          }

          if (block.type === 'footnote') {
            return (
              <div key={index} className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded border border-gray-100 dark:border-gray-700 mt-2 mb-6 font-sans">
                <span className="font-bold text-gray-400 dark:text-gray-500 mr-2">Сноска:</span>
                {block.text}
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
};

export default Reader;