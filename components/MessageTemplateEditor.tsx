'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { X, Save, RotateCcw, HelpCircle, Code, Undo2, Redo2 } from 'lucide-react';

interface MessageTemplateEditorProps {
  template: string;
  onSave: (template: string) => void;
  onCancel: () => void;
  onReset: () => void;
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

export default function MessageTemplateEditor({ 
  template, 
  onSave, 
  onCancel, 
  onReset 
}: MessageTemplateEditorProps) {
  const { t } = useLanguage();
  const [currentTemplate, setCurrentTemplate] = useState(template);
  const [showHelp, setShowHelp] = useState(false);
  const [originalTemplate] = useState(template); // Store original template for undo
  const [history, setHistory] = useState<string[]>([template]); // Track edit history
  const [historyIndex, setHistoryIndex] = useState(0); // Current position in history

  const handleSave = () => {
    onSave(currentTemplate);
  };

  const handleReset = () => {
    setCurrentTemplate(DEFAULT_TEMPLATE);
    onReset();
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentTemplate(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentTemplate(history[newIndex]);
    }
  };

  const handleTemplateChange = (newTemplate: string) => {
    setCurrentTemplate(newTemplate);
    
    // Add to history if it's different from current
    if (newTemplate !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newTemplate);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history.length]);

  const templateVariables = [
    { variable: '{guildName}', description: 'Guild name' },
    { variable: '{registrationCode}', description: 'Registration code' },
    { variable: '{mercenaryQuotas}', description: 'Number of mercenary quotas' },
    { variable: '{bossDate}', description: 'Boss fight date' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {t.message.editTemplate}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Variables Help */}
          <div className="bg-muted border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">{t.message.templateVariables}</h3>
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="ml-auto text-primary hover:text-primary/80"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
            
            {showHelp && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t.message.templateHelpText}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {templateVariables.map(({ variable, description }) => (
                    <div key={variable} className="flex items-center gap-2 text-sm">
                      <code className="bg-accent px-2 py-1 rounded text-foreground font-mono">
                        {variable}
                      </code>
                      <span className="text-muted-foreground">{description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Template Editor */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {t.message.messageTemplate}
            </label>
            <textarea
              value={currentTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full h-64 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground font-mono text-sm"
              placeholder="Enter your message template..."
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Preview (Example with sample data)
            </label>
            <div className="bg-muted border border-border rounded-md p-4">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                {currentTemplate
                  .replace(/{guildName}/g, 'Example Guild')
                  .replace(/{registrationCode}/g, 'ABC123')
                  .replace(/{mercenaryQuotas}/g, '5')
                  .replace(/{bossDate}/g, 'Monday, January 15, 2024')
                }
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Save className="h-4 w-4" />
              {t.message.saveTemplate}
            </button>
            
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 className="h-4 w-4" />
              Undo
            </button>
            
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
              className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Redo2 className="h-4 w-4" />
              Redo
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted"
            >
              <RotateCcw className="h-4 w-4" />
              {t.message.resetTemplate}
            </button>
            
            <button
              onClick={onCancel}
              className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
