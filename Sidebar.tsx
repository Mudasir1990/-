import React, { useMemo } from 'react';
import { BookChapter } from '../types';
import { BookOpen, ChevronRight, List, Bookmark } from 'lucide-react';

interface SidebarProps {
  data: BookChapter[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  bookmarks: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ data, activeSectionId, onSelectSection, isOpen, onClose, bookmarks }) => {
  
  // Create a map to find section titles by ID
  const bookmarkedSections = useMemo(() => {
    const results: { id: string; title: string }[] = [];
    if (bookmarks.length === 0) return results;

    const allSections = data.flatMap(c => c.sections);
    
    // Maintain the order of bookmarks as they were added (or could sort by book order)
    bookmarks.forEach(id => {
      const found = allSections.find(s => s.id === id);
      if (found) {
        results.push({ id: found.id, title: found.title });
      }
    });
    return results;
  }, [data, bookmarks]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 transition-all duration-300 ease-in-out overflow-y-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg text-white shadow-lg shadow-primary-500/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-serif font-bold text-gray-900 dark:text-white leading-tight">Исламское<br/>Семейное Право</h1>
          </div>
        </div>

        <nav className="p-4 space-y-6">
          {/* Top Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onSelectSection('TOC');
                if (window.innerWidth < 1024) onClose();
              }}
              className={`
                w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center gap-3 group
                ${activeSectionId === 'TOC'
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
              `}
            >
              <List size={18} className={activeSectionId === 'TOC' ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'} />
              <span>Оглавление</span>
            </button>
          </div>

          {/* Bookmarks Section */}
          {bookmarkedSections.length > 0 && (
            <div className="pb-2 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2">
                <Bookmark size={12} />
                <span>Закладки</span>
              </h2>
              <ul className="space-y-1">
                {bookmarkedSections.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSelectSection(item.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group
                        ${activeSectionId === item.id 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-medium' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
                      `}
                    >
                      <span className="line-clamp-1">{item.title}</span>
                      {activeSectionId === item.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.map((chapter) => (
            <div key={chapter.id}>
              <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-2">
                {chapter.title}
              </h2>
              <ul className="space-y-1">
                {chapter.sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => {
                        onSelectSection(section.id);
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between group
                        ${activeSectionId === section.id 
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 font-medium shadow-sm dark:shadow-none' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'}
                      `}
                    >
                      <span className="line-clamp-2">{section.title}</span>
                      {activeSectionId === section.id && (
                        <ChevronRight size={14} className="text-primary-500 dark:text-primary-400 shrink-0 ml-2" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        <div className="p-4 mt-auto border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
            На основе классических текстов.<br/>Перевод: Мудасир.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;