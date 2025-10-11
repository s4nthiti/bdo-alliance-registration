'use client';

import { useState, useEffect } from 'react';
import { Guild } from '@/lib/db';
import { generateDiscordMessage, generateCustomMessage, getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import MessageTemplateEditor from '@/components/MessageTemplateEditor';
import { Copy, Download, MessageSquare, Calendar, Edit3 } from 'lucide-react';

interface MessageGeneratorProps {
  guilds: Guild[];
}

const DEFAULT_TEMPLATE = `🏰 **BDO Guild Boss Registration - {bossDate}**

Please share the following information with your guild members:

**{guildName}**
📝 Registration Code: \`{registrationCode}\`
👥 Mercenary Quotas: **{mercenaryQuotas}**

⚠️ **Instructions:**
• Mercenaries should whisper the registration code in-game
• Each guild has limited quotas - first come, first served
• Boss fight is scheduled for {bossDate}

Good luck with the boss fight! 🎮`;

export default function MessageGenerator({ guilds }: MessageGeneratorProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [selectedGuildIds, setSelectedGuildIds] = useState<string[]>([]);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const nextMonday = getNextMonday();

  // Initialize with all guilds selected by default
  useEffect(() => {
    if (guilds.length > 0 && selectedGuildIds.length === 0) {
      setSelectedGuildIds(guilds.map(guild => guild.id));
    }
  }, [guilds, selectedGuildIds.length]);

  // Load saved template from localStorage
  useEffect(() => {
    const savedTemplate = localStorage.getItem('bdo_message_template');
    if (savedTemplate) {
      setMessageTemplate(savedTemplate);
    }
  }, []);

  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));

  const message = generateCustomMessage(
    messageTemplate,
    selectedGuilds.map(guild => ({
      name: guild.name,
      registration_code: guild.registration_code,
      mercenary_quotas: guild.mercenary_quotas
    })),
    formatDate(nextMonday)
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdo-guild-message-${nextMonday}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = (newTemplate: string) => {
    setMessageTemplate(newTemplate);
    localStorage.setItem('bdo_message_template', newTemplate);
    setShowTemplateEditor(false);
  };

  const handleResetTemplate = () => {
    setMessageTemplate(DEFAULT_TEMPLATE);
    localStorage.setItem('bdo_message_template', DEFAULT_TEMPLATE);
  };

  if (guilds.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.message.noGuildsAvailable}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.message.noGuildsSubtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t.message.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTemplateEditor(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
            {t.message.editTemplate}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{t.message.nextBoss}: {new Date(nextMonday).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.message.selectGuilds}
        </label>
        <GuildSelector
          guilds={guilds}
          selectedGuildIds={selectedGuildIds}
          onSelectionChange={setSelectedGuildIds}
          placeholder={t.message.selectGuilds}
        />
      </div>

      <div className="mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {message}
          </pre>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Copy className="h-4 w-4" />
          {copied ? t.message.copied : t.message.copyMessage}
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          {t.message.downloadText}
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>{t.message.tip}:</strong> {t.message.tipMessage}
        </p>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && (
        <MessageTemplateEditor
          template={messageTemplate}
          onSave={handleSaveTemplate}
          onCancel={() => setShowTemplateEditor(false)}
          onReset={handleResetTemplate}
        />
      )}
    </div>
  );
}
