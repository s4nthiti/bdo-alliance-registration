'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Guild, Registration } from '@/lib/db';
import { getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import { useQuotaUpdates } from '@/lib/useQuotaUpdates';
import { Users, Plus, Minus, Save, Calendar, Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface QuotaTrackerProps {
  guilds: Guild[];
}

// Memoized component for individual quota items
const QuotaItem = memo(({ 
  registration, 
  guild, 
  isSaving, 
  onAdjustQuotas 
}: {
  registration: Registration & { guild_name: string };
  guild: Guild;
  isSaving: boolean;
  onAdjustQuotas: (id: string, delta: number) => void;
}) => {
  const isAtMax = registration.used_quotas >= guild.mercenary_quotas;
  const { t } = useLanguage();

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{registration.guild_name}</h3>
          <div className="text-sm text-muted-foreground mt-1">
            <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
              {registration.registration_code}
            </code>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {registration.used_quotas} / {guild.mercenary_quotas} quotas
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onAdjustQuotas(registration.id, -1)}
          disabled={registration.used_quotas <= 0 || isSaving}
          className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="flex-1 text-center">
          <span className="text-2xl font-bold text-foreground">
            {registration.used_quotas}
          </span>
        </div>

        <button
          onClick={() => onAdjustQuotas(registration.id, 1)}
          disabled={isAtMax || isSaving}
          className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isSaving && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Saving...</span>
        </div>
      )}

      {isAtMax && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            {t.tracker.quotaLimitMessage}
          </p>
        </div>
      )}
    </div>
  );
});

QuotaItem.displayName = 'QuotaItem';

export default function QuotaTracker({ guilds }: QuotaTrackerProps) {
  const { t } = useLanguage();
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedGuildIds, setSelectedGuildIds] = useState<string[]>([]);
  const nextMonday = getNextMonday();

  // Use real-time quota updates
  const { registrations, loading, error, isConnected, reconnect } = useQuotaUpdates(nextMonday);

  console.log('QuotaTracker rendered with guilds:', guilds);
  console.log('Real-time connection status:', isConnected ? 'Connected' : 'Disconnected');

  const initializeRegistrations = async () => {
    try {
      console.log('Initializing registrations for all guilds:', guilds.length);
      // Create registrations for ALL guilds if they don't exist
      for (const guild of guilds) {
        const existingRegistration = registrations.find(r => r.guild_id === guild.id);
        if (!existingRegistration) {
          console.log('Creating registration for guild:', guild.name);
          const response = await fetch('/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guild_id: guild.id,
              registration_code: guild.registration_code,
              used_quotas: 0,
              boss_date: nextMonday
            })
          });
          if (!response.ok) throw new Error('Failed to create registration');
        }
      }
      console.log('Registrations created, real-time updates will handle the refresh');
    } catch (error) {
      console.error('Failed to initialize registrations:', error);
    }
  };

  const updateQuotas = useCallback(async (registrationId: string, newQuotas: number) => {
    try {
      setSaving(prev => ({ ...prev, [registrationId]: true }));
      
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedQuotas: newQuotas })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quotas');
      }
      
      // Real-time updates will handle refreshing the data
    } catch (error) {
      console.error('Failed to update quotas:', error);
    } finally {
      setSaving(prev => ({ ...prev, [registrationId]: false }));
    }
  }, []);

  const adjustQuotas = useCallback((registrationId: string, delta: number) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (registration) {
      const guild = guilds.find(g => g.id === registration.guild_id);
      if (guild) {
        const newQuotas = Math.max(0, Math.min(registration.used_quotas + delta, guild.mercenary_quotas));
        updateQuotas(registrationId, newQuotas);
      }
    }
  }, [registrations, guilds, updateQuotas]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <WifiOff className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-red-900">Connection Error</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={reconnect}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  // Filter registrations by selected guilds (if any are selected, otherwise show all)
  const filteredRegistrations = selectedGuildIds.length > 0 
    ? registrations.filter(reg => selectedGuildIds.includes(reg.guild_id))
    : registrations;
  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));
  
  console.log('Filtered registrations:', filteredRegistrations.length, 'Total registrations:', registrations.length, 'Selected guilds:', selectedGuildIds.length);

  // Always show the guild selector, don't return early

  if (filteredRegistrations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.tracker.noRegistrations}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.tracker.noRegistrationsSubtitle}
          </p>
          <button
            onClick={initializeRegistrations}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            {t.tracker.initializeRegistrations}
          </button>
        </div>
      </div>
    );
  }

  const totalUsedQuotas = filteredRegistrations.reduce((sum, r) => sum + r.used_quotas, 0);
  const totalAvailableQuotas = selectedGuilds.reduce((sum, g) => sum + g.mercenary_quotas, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-foreground">{t.tracker.title}</h2>
          <div className="flex items-center gap-1 ml-2">
            {isConnected ? (
              <div title="Real-time updates active">
                <Wifi className="h-4 w-4 text-green-500" />
              </div>
            ) : (
              <div title="Real-time updates disconnected">
                <WifiOff className="h-4 w-4 text-red-500" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{t.tracker.bossDate}: {formatDate(nextMonday)}</span>
        </div>
      </div>

      <div 
        className="mb-6"
        onClick={(e) => {
          console.log('QuotaTracker container clicked');
        }}
        style={{ pointerEvents: 'auto' }}
      >
        <label className="block text-sm font-medium text-foreground mb-2">
          {t.tracker.selectGuilds}
        </label>
        <GuildSelector
          guilds={guilds}
          selectedGuildIds={selectedGuildIds}
          onSelectionChange={(newSelection) => {
            console.log('QuotaTracker received selection change:', newSelection);
            setSelectedGuildIds(newSelection);
          }}
          placeholder={t.tracker.selectGuilds}
        />
      </div>

      {selectedGuildIds.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">{t.tracker.noGuildsSelected}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select guilds above to track their quota usage
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalUsedQuotas}</p>
                <p className="text-sm text-muted-foreground">{t.tracker.usedQuotas}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{totalAvailableQuotas - totalUsedQuotas}</p>
                <p className="text-sm text-muted-foreground">{t.tracker.availableQuotas}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">{totalAvailableQuotas}</p>
                <p className="text-sm text-muted-foreground">{t.tracker.totalQuotas}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
        {filteredRegistrations.map((registration) => {
          const guild = guilds.find(g => g.id === registration.guild_id);
          if (!guild) return null;

          return (
            <QuotaItem
              key={registration.id}
              registration={registration}
              guild={guild}
              isSaving={saving[registration.id]}
              onAdjustQuotas={adjustQuotas}
            />
          );
        })}
      </div>

          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>{t.tracker.instructions}:</strong> {t.tracker.instructionsMessage}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
