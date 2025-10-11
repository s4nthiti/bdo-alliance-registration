'use client';

import { useLanguage } from './LanguageProvider';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'th')}
        className="bg-transparent border-none text-sm text-gray-600 hover:text-gray-900 focus:outline-none cursor-pointer"
      >
        <option value="en">English</option>
        <option value="th">ไทย</option>
      </select>
    </div>
  );
}
