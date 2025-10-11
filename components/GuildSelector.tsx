'use client';

import { useState } from 'react';
import { Guild } from '@/lib/db';
import { useLanguage } from '@/components/LanguageProvider';
import { Check, ChevronDown, Users } from 'lucide-react';

interface GuildSelectorProps {
  guilds: Guild[];
  selectedGuildIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
}

export default function GuildSelector({ 
  guilds, 
  selectedGuildIds, 
  onSelectionChange, 
  placeholder 
}: GuildSelectorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));
  const allSelected = selectedGuildIds.length === guilds.length;
  const noneSelected = selectedGuildIds.length === 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(guilds.map(guild => guild.id));
    }
  };

  const handleToggleGuild = (guildId: string) => {
    if (selectedGuildIds.includes(guildId)) {
      onSelectionChange(selectedGuildIds.filter(id => id !== guildId));
    } else {
      onSelectionChange([...selectedGuildIds, guildId]);
    }
  };

  const getDisplayText = () => {
    if (noneSelected) {
      return placeholder || t.message.noGuildsSelected;
    }
    if (allSelected) {
      return t.message.allGuilds;
    }
    if (selectedGuilds.length === 1) {
      return selectedGuilds[0].name;
    }
    return `${selectedGuilds.length} ${t.message.selectedGuilds.toLowerCase()}`;
  };

  if (guilds.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
        <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm">{t.guilds.noGuilds}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left"
      >
        <span className="block truncate text-gray-900">
          {getDisplayText()}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200">
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                allSelected ? 'bg-blue-600 border-blue-600' : 'bg-white'
              }`}>
                {allSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              {allSelected ? t.message.allGuilds : t.message.allGuilds}
            </button>
          </div>
          
          <div className="py-1">
            {guilds.map((guild) => {
              const isSelected = selectedGuildIds.includes(guild.id);
              return (
                <button
                  key={guild.id}
                  type="button"
                  onClick={() => handleToggleGuild(guild.id)}
                  className="w-full flex items-center gap-2 px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <div className={`w-4 h-4 border border-gray-300 rounded flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{guild.name}</div>
                    <div className="text-xs text-gray-500">
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono break-all">
                        {guild.registration_code}
                      </code>
                      <span className="ml-1">• {guild.mercenary_quotas} quotas</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
