'use client';

import { useState, useEffect } from 'react';
import { Guild, Registration } from '@/lib/db';
import { getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import { Users, Plus, Minus, Save, Calendar } from 'lucide-react';

interface QuotaTrackerProps {
  guilds: Guild[];
}

export default function QuotaTracker({ guilds }: QuotaTrackerProps) {
  const { t } = useLanguage();
  const [registrations, setRegistrations] = useState<(Registration & { guild_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedGuildIds, setSelectedGuildIds] = useState<string[]>([]);
  const nextMonday = getNextMonday();

  // Initialize with all guilds selected by default
  useEffect(() => {
    if (guilds.length > 0 && selectedGuildIds.length === 0) {
      setSelectedGuildIds(guilds.map(guild => guild.id));
    }
  }, [guilds, selectedGuildIds.length]);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/registrations?bossDate=${nextMonday}`);
      if (!response.ok) throw new Error('Failed to load registrations');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeRegistrations = async () => {
    try {
      setLoading(true);
      // Create registrations for selected guilds if they don't exist
      const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));
      for (const guild of selectedGuilds) {
        const existingRegistration = registrations.find(r => r.guild_id === guild.id);
        if (!existingRegistration) {
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
      await loadRegistrations();
    } catch (error) {
      console.error('Failed to initialize registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuotas = async (registrationId: string, newQuotas: number) => {
    try {
      setSaving(prev => ({ ...prev, [registrationId]: true }));
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedQuotas: newQuotas })
      });
      if (!response.ok) throw new Error('Failed to update quotas');
      await loadRegistrations();
    } catch (error) {
      console.error('Failed to update quotas:', error);
    } finally {
      setSaving(prev => ({ ...prev, [registrationId]: false }));
    }
  };

  const adjustQuotas = (registrationId: string, delta: number) => {
    const registration = registrations.find(r => r.id === registrationId);
    if (registration) {
      const newQuotas = Math.max(0, registration.used_quotas + delta);
      updateQuotas(registrationId, newQuotas);
    }
  };

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

  // Filter registrations by selected guilds
  const filteredRegistrations = registrations.filter(reg => selectedGuildIds.includes(reg.guild_id));
  const selectedGuilds = guilds.filter(guild => selectedGuildIds.includes(guild.id));

  if (selectedGuildIds.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t.tracker.noGuildsSelected}</h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.tracker.selectGuilds}
          </p>
        </div>
      </div>
    );
  }

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
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t.tracker.title}</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{t.tracker.bossDate}: {formatDate(nextMonday)}</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t.tracker.selectGuilds}
        </label>
        <GuildSelector
          guilds={guilds}
          selectedGuildIds={selectedGuildIds}
          onSelectionChange={setSelectedGuildIds}
          placeholder={t.tracker.selectGuilds}
        />
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{totalUsedQuotas}</p>
            <p className="text-sm text-gray-600">{t.tracker.usedQuotas}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{totalAvailableQuotas - totalUsedQuotas}</p>
            <p className="text-sm text-gray-600">{t.tracker.availableQuotas}</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{totalAvailableQuotas}</p>
            <p className="text-sm text-gray-600">{t.tracker.totalQuotas}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredRegistrations.map((registration) => {
          const guild = guilds.find(g => g.id === registration.guild_id);
          if (!guild) return null;

          const isSaving = saving[registration.id];
          const isAtMax = registration.used_quotas >= guild.mercenary_quotas;

          return (
            <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{registration.guild_name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all">
                      {registration.registration_code}
                    </code>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {registration.used_quotas} / {guild.mercenary_quotas} quotas
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => adjustQuotas(registration.id, -1)}
                  disabled={registration.used_quotas <= 0 || isSaving}
                  className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {registration.used_quotas}
                  </span>
                </div>

                <button
                  onClick={() => adjustQuotas(registration.id, 1)}
                  disabled={isAtMax || isSaving}
                  className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>

                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Saving...</span>
                  </div>
                )}
              </div>

              {isAtMax && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    {t.tracker.quotaLimitMessage}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>{t.tracker.instructions}:</strong> {t.tracker.instructionsMessage}
        </p>
      </div>
    </div>
  );
}
