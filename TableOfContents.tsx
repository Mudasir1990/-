import React from 'react';
import { BookChapter } from '../types';
import { ChevronRight, Book } from 'lucide-react';

interface TableOfContentsProps {
  data: BookChapter[];
  onSelectSection: (id: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ data, onSelectSection }) => {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 lg:py-16 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
          <Book size={28} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100">
          Оглавление
        </h1>
      </div>
      
      <div className="space-y-8">
        {data.map((chapter) => (
          <div key={chapter.id} className="space-y-3">
            <h2 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider pl-1">
              {chapter.title}
            </h2>
            <div className="grid gap-3">
              {chapter.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => onSelectSection(section.id)}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700/50 hover:shadow-md dark:hover:bg-gray-750 transition-all group text-left"
                >
                  <span className="text-lg font-serif text-gray-800 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                    {section.title}
                  </span>
                  <div className="p-1 rounded-full text-gray-300 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all">
                    <ChevronRight size={20} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOfContents;