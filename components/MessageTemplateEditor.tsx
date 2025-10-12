'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { X, Save, RotateCcw, HelpCircle, Code } from 'lucide-react';

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

  const handleSave = () => {
    onSave(currentTemplate);
  };

  const handleReset = () => {
    setCurrentTemplate(DEFAULT_TEMPLATE);
    onReset();
  };

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
              onChange={(e) => setCurrentTemplate(e.target.value)}
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
