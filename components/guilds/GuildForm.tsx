'use client';

import { useState } from 'react';
import { Guild } from '@/lib/db';
import { generateRegistrationCode } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import { X, Save } from 'lucide-react';

interface GuildFormProps {
  guild?: Guild;
  onSave: (guild: Omit<Guild, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export default function GuildForm({ guild, onSave, onCancel }: GuildFormProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: guild?.name || '',
    registration_code: guild?.registration_code || generateRegistrationCode(),
    mercenary_quotas: guild?.mercenary_quotas || 0,
    contact_info: guild?.contact_info || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.guilds.nameRequired;
    }

    if (!formData.registration_code.trim()) {
      newErrors.registration_code = t.guilds.codeRequired;
    } else if (formData.registration_code.length > 100) {
      newErrors.registration_code = t.guilds.codeTooLong;
    }

    if (formData.mercenary_quotas < 0) {
      newErrors.mercenary_quotas = t.guilds.quotasPositive;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const generateNewCode = () => {
    setFormData(prev => ({ ...prev, registration_code: generateRegistrationCode() }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {guild ? t.guilds.editGuild : t.guilds.addGuild}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              {t.guilds.guildName} *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground ${
                errors.name ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t.guilds.guildName}
            />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="registration_code" className="block text-sm font-medium text-foreground mb-1">
              {t.guilds.registrationCode} *
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <textarea
                  id="registration_code"
                  value={formData.registration_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, registration_code: e.target.value.toUpperCase() }))}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground font-mono text-sm resize-none ${
                    errors.registration_code ? 'border-destructive' : 'border-border'
                  }`}
                  placeholder={t.guilds.registrationCode}
                  maxLength={100}
                  rows={2}
                />
                <button
                  type="button"
                  onClick={generateNewCode}
                  className="px-3 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary self-start"
                >
                  {t.guilds.generateCode}
                </button>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {formData.registration_code.length}/100 characters
              </div>
            </div>
            {errors.registration_code && <p className="text-destructive text-sm mt-1">{errors.registration_code}</p>}
          </div>

          <div>
            <label htmlFor="mercenary_quotas" className="block text-sm font-medium text-foreground mb-1">
              {t.guilds.mercenaryQuotas} *
            </label>
            <input
              type="number"
              id="mercenary_quotas"
              value={formData.mercenary_quotas}
              onChange={(e) => setFormData(prev => ({ ...prev, mercenary_quotas: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground ${
                errors.mercenary_quotas ? 'border-destructive' : 'border-border'
              }`}
              placeholder={t.guilds.mercenaryQuotas}
              min="0"
            />
            {errors.mercenary_quotas && <p className="text-destructive text-sm mt-1">{errors.mercenary_quotas}</p>}
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-foreground mb-1">
              {t.guilds.contactInfo}
            </label>
            <textarea
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder-muted-foreground"
              placeholder={t.guilds.contactInfo}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Save className="h-4 w-4" />
              {guild ? t.guilds.editGuild : t.guilds.addGuild}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-md hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-muted"
            >
              {t.common.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
