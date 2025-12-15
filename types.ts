export interface BookSection {
  id: string;
  title: string;
  content: (string | { type: 'header'; text: string } | { type: 'list'; items: string[] } | { type: 'quote'; text: string; source?: string } | { type: 'footnote'; text: string })[];
}

export interface BookChapter {
  id: string;
  title: string;
  sections: BookSection[];
}