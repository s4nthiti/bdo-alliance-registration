'use client';

import { useState, useEffect } from 'react';
import { Guild, MessageTemplate } from '@/lib/db';
import { generateDiscordMessage, generateCustomMessage, getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import MessageTemplateEditor from '@/components/MessageTemplateEditor';
import { Copy, Download, MessageSquare, Calendar, Edit3, Save, Loader2 } from 'lucide-react';

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
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [bossDate, setBossDate] = useState<string>(() => {
    // Initialize with next Monday
    return getNextMonday();
  });

  // No auto-selection - let user choose which guilds to select

  // Load templates from database
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/message-templates');
        if (response.ok) {
          const templatesData = await response.json();
          setTemplates(templatesData);
          
          // Find default template or use first template
          const defaultTemplate = templatesData.find((t: MessageTemplate) => t.is_default);
          if (defaultTemplate) {
            setMessageTemplate(defaultTemplate.content);
            setCurrentTemplateId(defaultTemplate.id);
          } else if (templatesData.length > 0) {
            setMessageTemplate(templatesData[0].content);
            setCurrentTemplateId(templatesData[0].id);
          }
        } else {
          console.error('Failed to load templates');
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));

  // Generate individual messages for each guild
  const individualMessages = selectedGuilds.map(guild => {
    const guildMessage = generateCustomMessage(
      messageTemplate,
      [{
        name: guild.name,
        registration_code: guild.registration_code,
        mercenary_quotas: guild.mercenary_quotas
      }],
      formatDate(bossDate)
    );
    return {
      guild: guild,
      message: guildMessage
    };
  });

  // Combine all messages with dividers
  const message = individualMessages.map((item, index) => {
    const divider = index > 0 ? '\n\n' + '─'.repeat(50) + '\n\n' : '';
    return divider + `**${item.guild.name}**\n${item.message}`;
  }).join('');

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
    a.download = `bdo-guild-message-${bossDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveTemplate = async (newTemplate: string, templateName?: string) => {
    try {
      setIsSaving(true);
      
      if (currentTemplateId) {
        // Update existing template
        const response = await fetch('/api/message-templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentTemplateId,
            content: newTemplate,
            name: templateName || 'Custom Template'
          })
        });
        
        if (response.ok) {
          const updatedTemplate = await response.json();
          setTemplates(prev => prev.map(t => t.id === currentTemplateId ? updatedTemplate : t));
        }
      } else {
        // Create new template
        const response = await fetch('/api/message-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: templateName || 'Custom Template',
            content: newTemplate,
            is_default: templates.length === 0 // Set as default if it's the first template
          })
        });
        
        if (response.ok) {
          const newTemplate = await response.json();
          setTemplates(prev => [...prev, newTemplate]);
          setCurrentTemplateId(newTemplate.id);
        }
      }
      
      setMessageTemplate(newTemplate);
      setShowTemplateEditor(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplate = () => {
    setMessageTemplate(DEFAULT_TEMPLATE);
    setCurrentTemplateId(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setMessageTemplate(template.content);
      setCurrentTemplateId(templateId);
    }
  };

  const handleSetAsDefault = async (templateId: string) => {
    try {
      const response = await fetch('/api/message-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: templateId,
          set_as_default: true
        })
      });
      
      if (response.ok) {
        // Reload templates to get updated default status
        const templatesResponse = await fetch('/api/message-templates');
        if (templatesResponse.ok) {
          const updatedTemplates = await templatesResponse.json();
          setTemplates(updatedTemplates);
        }
      }
    } catch (error) {
      console.error('Failed to set default template:', error);
    }
  };

  if (guilds.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">{t.message.noGuildsAvailable}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.message.noGuildsSubtitle}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-foreground">{t.message.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTemplateEditor(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-muted text-muted-foreground rounded-md hover:bg-accent transition-colors"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Edit3 className="h-4 w-4" />}
            {isSaving ? 'Saving...' : t.message.editTemplate}
          </button>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <label className="text-muted-foreground">{t.message.nextBoss}:</label>
            <div className="relative">
              <input
                type="date"
                value={bossDate}
                onChange={(e) => setBossDate(e.target.value)}
                className="w-32 px-2 py-1 text-sm bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 opacity-0 absolute inset-0 z-10"
              />
              <div className="w-32 px-2 py-1 text-sm bg-background border border-border rounded text-foreground text-center">
                {bossDate ? new Date(bossDate + 'T00:00:00').toLocaleDateString('th-TH', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : 'DD/MM/YYYY'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector */}
      {templates.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Template
          </label>
          <div className="flex items-center gap-2">
            <select
              value={currentTemplateId || ''}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded text-foreground bg-background focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.is_default ? '(Default)' : ''}
                </option>
              ))}
            </select>
            {currentTemplateId && (
              <button
                onClick={() => handleSetAsDefault(currentTemplateId)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                title="Set as default template"
              >
                <Save className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-2">
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
        {individualMessages.length > 0 ? (
          <div className="space-y-4">
            {individualMessages.map((item, index) => (
              <div key={item.guild.id} className="bg-muted border border-border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <h4 className="font-semibold text-foreground">{item.guild.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    ({item.guild.mercenary_quotas} quotas)
                  </span>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                  {item.message}
                </pre>
                {index < individualMessages.length - 1 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="text-center text-muted-foreground text-xs">
                      ──────────────────────────────────────────────────
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-muted border border-border rounded-md p-4">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-8 w-8 mb-2" />
              <p className="text-sm">Select guilds to generate messages</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          <Copy className="h-4 w-4" />
          {copied ? t.message.copied : t.message.copyMessage}
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          {t.message.downloadText}
        </button>
      </div>

      <div className="mt-4 p-3 bg-muted border border-border rounded-md">
        <p className="text-sm text-muted-foreground">
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
