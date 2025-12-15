import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Reader from './components/Reader';
import TableOfContents from './components/TableOfContents';
import { bookData } from './bookData';
import { Menu, Minus, Plus, Type, Moon, Sun, ChevronLeft, ChevronRight, List } from 'lucide-react';

const FONT_SIZES = ['prose-sm', 'prose-base', 'prose-lg', 'prose-xl', 'prose-2xl'];

const App: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('intro-1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Initialize from local storage or default to index 2 (prose-lg)
  const [fontSizeIndex, setFontSizeIndex] = useState(() => {
    try {
      const saved = localStorage.getItem('fontSizeIndex');
      return saved !== null ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Save font size to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('fontSizeIndex', fontSizeIndex.toString());
  }, [fontSizeIndex]);

  // Save bookmarks to local storage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (sectionId: string) => {
    setBookmarks(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const isTOC = activeSectionId === 'TOC';

  // Find active chapter info
  const activeChapterInfo = useMemo(() => {
    if (isTOC) return null;
    for (const chapter of bookData) {
      const index = chapter.sections.findIndex(s => s.id === activeSectionId);
      if (index !== -1) {
        return {
          title: chapter.title,
          index: index,
          total: chapter.sections.length,
          section: chapter.sections[index]
        };
      }
    }
    // Fallback
    const firstChapter = bookData[0];
    return {
      title: firstChapter.title,
      index: 0,
      total: firstChapter.sections.length,
      section: firstChapter.sections[0]
    };
  }, [activeSectionId, isTOC]);

  const activeSection = activeChapterInfo?.section;

  // Calculate previous and next sections
  const { prevSection, nextSection } = useMemo(() => {
    const allSections = bookData.flatMap(chapter => chapter.sections);
    
    if (isTOC) {
      return { 
        prevSection: null, 
        nextSection: { id: allSections[0].id, title: allSections[0].title } 
      };
    }

    const currentIndex = allSections.findIndex(s => s.id === activeSectionId);
    
    return {
      prevSection: currentIndex > 0 
        ? allSections[currentIndex - 1] 
        : { id: 'TOC', title: 'Оглавление' },
      nextSection: currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null
    };
  }, [activeSectionId, isTOC]);

  // Scroll to top when section changes
  useEffect(() => {
    window.scrollTo(0, 0);
    const mainElement = document.querySelector('main');
    if (mainElement) mainElement.scrollTo(0, 0);
  }, [activeSectionId]);

  const increaseFont = () => setFontSizeIndex(prev => Math.min(prev + 1, FONT_SIZES.length - 1));
  const decreaseFont = () => setFontSizeIndex(prev => Math.max(prev - 1, 0));
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden transition-colors duration-300">
      <Sidebar 
        data={bookData} 
        activeSectionId={activeSectionId} 
        onSelectSection={setActiveSectionId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        bookmarks={bookmarks}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 transition-all duration-300">
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm shrink-0 transition-colors duration-300">
          <div className="flex items-center min-w-0">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md lg:hidden shrink-0 transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="ml-3 font-semibold text-gray-900 dark:text-gray-100 truncate lg:hidden">
              {isTOC ? 'Оглавление' : activeSection?.title}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-2">
            <button
              onClick={() => setActiveSectionId('TOC')}
              className={`p-2 rounded-full transition-colors ${isTOC 
                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              aria-label="Оглавление"
            >
              <List size={20} />
            </button>

            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Переключить тему"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {!isTOC && (
              <div className="hidden sm:flex items-center gap-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700 transition-colors">
                <button 
                  onClick={decreaseFont} 
                  disabled={fontSizeIndex === 0}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-95"
                  aria-label="Уменьшить шрифт"
                >
                  <Minus size={18} />
                </button>
                <div className="px-2 text-gray-400 dark:text-gray-500 select-none flex items-center justify-center w-8" title="Размер шрифта">
                  <Type size={20} />
                </div>
                <button 
                  onClick={increaseFont} 
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:shadow-none transition-all active:scale-95"
                  aria-label="Увеличить шрифт"
                >
                  <Plus size={18} />
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth w-full bg-white dark:bg-gray-900 transition-colors duration-300">
          {isTOC ? (
            <TableOfContents data={bookData} onSelectSection={setActiveSectionId} />
          ) : (
            activeSection && (
              <Reader 
                section={activeSection} 
                fontSizeClass={FONT_SIZES[fontSizeIndex]} 
                chapterTitle={activeChapterInfo?.title}
                currentSectionIndex={activeChapterInfo?.index}
                totalSections={activeChapterInfo?.total}
                isBookmarked={bookmarks.includes(activeSection.id)}
                onToggleBookmark={() => toggleBookmark(activeSection.id)}
              />
            )
          )}
          
          {/* Navigation Footer */}
          <footer className="max-w-3xl mx-auto px-6 py-8 border-t border-gray-100 dark:border-gray-800 mt-8 mb-12 flex justify-between items-center transition-colors">
            {prevSection ? (
              <button
                onClick={() => setActiveSectionId(prevSection.id)}
                className="flex items-center gap-2 group text-left max-w-[45%]"
              >
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  <ChevronLeft size={20} />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Назад</div>
                  <div className="text-sm font-serif font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors line-clamp-1">
                    {prevSection.title}
                  </div>
                </div>
              </button>
            ) : <div />}

            {nextSection ? (
              <button
                onClick={() => setActiveSectionId(nextSection.id)}
                className="flex items-center gap-2 group text-right max-w-[45%]"
              >
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Далее</div>
                  <div className="text-sm font-serif font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors line-clamp-1">
                    {nextSection.title}
                  </div>
                </div>
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  <ChevronRight size={20} />
                </div>
              </button>
            ) : <div />}
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;