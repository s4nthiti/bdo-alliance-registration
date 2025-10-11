'use client';

import { useState, useEffect } from 'react';
import { Guild, Registration, getRegistrationsByDate, createRegistration, updateRegistrationQuotas } from '@/lib/db';
import { getNextMonday, formatDate } from '@/lib/utils';
import { Users, Plus, Minus, Save, Calendar } from 'lucide-react';

interface QuotaTrackerProps {
  guilds: Guild[];
}

export default function QuotaTracker({ guilds }: QuotaTrackerProps) {
  const [registrations, setRegistrations] = useState<(Registration & { guild_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const nextMonday = getNextMonday();

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await getRegistrationsByDate(nextMonday);
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
      // Create registrations for all guilds if they don't exist
      for (const guild of guilds) {
        const existingRegistration = registrations.find(r => r.guild_id === guild.id);
        if (!existingRegistration) {
          await createRegistration({
            guild_id: guild.id,
            registration_code: guild.registration_code,
            used_quotas: 0,
            boss_date: nextMonday
          });
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
      await updateRegistrationQuotas(registrationId, newQuotas);
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
          <p className="mt-2 text-sm text-gray-600">Loading quota tracker...</p>
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No registrations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Initialize registrations for the next boss fight.
          </p>
          <button
            onClick={initializeRegistrations}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Initialize Registrations
          </button>
        </div>
      </div>
    );
  }

  const totalUsedQuotas = registrations.reduce((sum, r) => sum + r.used_quotas, 0);
  const totalAvailableQuotas = guilds.reduce((sum, g) => sum + g.mercenary_quotas, 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Quota Tracker</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Boss Date: {formatDate(nextMonday)}</span>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-600">{totalUsedQuotas}</p>
            <p className="text-sm text-gray-600">Used Quotas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{totalAvailableQuotas - totalUsedQuotas}</p>
            <p className="text-sm text-gray-600">Available Quotas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">{totalAvailableQuotas}</p>
            <p className="text-sm text-gray-600">Total Quotas</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {registrations.map((registration) => {
          const guild = guilds.find(g => g.id === registration.guild_id);
          if (!guild) return null;

          const isSaving = saving[registration.id];
          const isAtMax = registration.used_quotas >= guild.mercenary_quotas;

          return (
            <div key={registration.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{registration.guild_name}</h3>
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
                    ⚠️ This guild has reached its quota limit
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>Instructions:</strong> Use the + and - buttons to track how many mercenaries 
          have registered for each guild. This helps you monitor quota usage during the boss fight.
        </p>
      </div>
    </div>
  );
}
