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

  console.log('GuildSelector rendered with:', { 
    guildsCount: guilds.length, 
    selectedCount: selectedGuildIds.length, 
    isOpen 
  });

  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));
  const allSelected = selectedGuildIds.length === guilds.length;
  const noneSelected = selectedGuildIds.length === 0;

  const handleSelectAll = () => {
    console.log('handleSelectAll called, allSelected:', allSelected);
    if (allSelected) {
      console.log('Deselecting all guilds');
      onSelectionChange([]);
    } else {
      console.log('Selecting all guilds:', guilds.map(guild => guild.id));
      onSelectionChange(guilds.map(guild => guild.id));
    }
  };

  const handleToggleGuild = (guildId: string) => {
    console.log('handleToggleGuild called for guildId:', guildId, 'currently selected:', selectedGuildIds);
    if (selectedGuildIds.includes(guildId)) {
      const newSelection = selectedGuildIds.filter(id => id !== guildId);
      console.log('Removing guild, new selection:', newSelection);
      onSelectionChange(newSelection);
    } else {
      const newSelection = [...selectedGuildIds, guildId];
      console.log('Adding guild, new selection:', newSelection);
      onSelectionChange(newSelection);
    }
  };

  const getDisplayText = () => {
    if (noneSelected) {
      return placeholder || t.message.selectGuilds;
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
    console.log('GuildSelector: No guilds available, showing empty state');
    return (
      <div className="p-4 text-center text-muted-foreground bg-muted rounded-lg">
        <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm">{t.guilds.noGuilds}</p>
      </div>
    );
  }

  console.log('GuildSelector: Rendering button with guilds:', guilds.length);

  return (
    <div 
      className="relative"
      onClick={(e) => {
        console.log('Parent div clicked');
        e.stopPropagation();
      }}
      style={{ pointerEvents: 'auto' }}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('GuildSelector button clicked, current isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          console.log('GuildSelector button mousedown');
        }}
        className="w-full flex items-center justify-between px-3 py-2 bg-background border-2 border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-left hover:bg-accent cursor-pointer"
        style={{ pointerEvents: 'auto', zIndex: 10, minHeight: '40px' }}
      >
        <span className="block truncate text-foreground">
          {getDisplayText()}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-border">
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full flex items-center gap-2 px-2 py-1 text-sm text-foreground hover:bg-accent rounded"
            >
              <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                allSelected ? 'bg-primary border-primary' : 'bg-background'
              }`}>
                {allSelected && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
              {allSelected ? t.message.deselectAll : t.message.selectAll}
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
                  className="w-full flex items-center gap-2 px-2 py-1 text-sm text-foreground hover:bg-accent"
                >
                  <div className={`w-4 h-4 border border-border rounded flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'bg-background'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{guild.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono break-all">
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
          onClick={() => {
            console.log('Overlay clicked, closing dropdown');
            setIsOpen(false);
          }}
        />
      )}

    </div>
  );
}
