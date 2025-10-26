'use client';

import { useState, useEffect, useCallback } from 'react';
import { Guild, Registration, Mercenary } from '@/lib/db';
import { getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import { useQuotaUpdates } from '@/lib/useQuotaUpdates';
import { useSSE } from '@/lib/useSSE';
import AddMercenaryModal from '@/components/dashboard/AddMercenaryModal';
import MercenariesTable from '@/components/dashboard/MercenariesTable';
import { Users, Plus, Calendar, Loader2, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

interface QuotaTrackerProps {
  guilds: Guild[];
}


export default function QuotaTracker({ guilds }: QuotaTrackerProps) {
  const { t } = useLanguage();
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedGuildIds, setSelectedGuildIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Helper function to get Thai date
  const getThaiDate = () => {
    const now = new Date();
    // Use Intl.DateTimeFormat to get Thai date
    const thaiDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    
    console.log('Thai date calculation:', {
      original: now.toISOString(),
      thaiDate: thaiDate,
      result: thaiDate
    });
    return thaiDate;
  };
  
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Initialize with today's date in Thai timezone
    return getThaiDate();
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [mercenaries, setMercenaries] = useState<(Mercenary & { guild_name: string; registration_code: string })[]>([]);
  const [operationInProgress, setOperationInProgress] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState<string>('');

  // Use real-time quota updates with selected date
  const { registrations, loading, error, isConnected, reconnect } = useQuotaUpdates(selectedDate);
  
  // Use Server-Sent Events for real-time updates
  const { isConnected: sseConnected, error: sseError, reconnect: sseReconnect } = useSSE(selectedDate);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      const timeString = now.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setCurrentTime(timeString);
    };

    // Update immediately
    updateTime();
    
    // Update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  console.log('QuotaTracker rendered with guilds:', guilds);
  console.log('Real-time connection status:', isConnected ? 'Connected' : 'Disconnected');

  // Fetch mercenaries for the selected date
  const fetchMercenaries = useCallback(async () => {
    try {
      const response = await fetch(`/api/mercenaries?bossDate=${encodeURIComponent(selectedDate)}`);
      if (response.ok) {
        const data = await response.json();
        setMercenaries(data);
      }
    } catch (error) {
      console.error('Failed to fetch mercenaries:', error);
    }
  }, [selectedDate]);

  // Fetch mercenaries when date changes
  useEffect(() => {
    fetchMercenaries();
  }, [fetchMercenaries]);

  // Listen for SSE events to refresh data
  useEffect(() => {
    const handleQuotaUpdate = () => {
      console.log('SSE: Quota update received, refreshing data...');
      fetchMercenaries();
    };

    const handleMercenaryUpdate = () => {
      console.log('SSE: Mercenary update received, refreshing data...');
      fetchMercenaries();
    };

    window.addEventListener('quotaUpdate', handleQuotaUpdate);
    window.addEventListener('mercenaryUpdate', handleMercenaryUpdate);

    return () => {
      window.removeEventListener('quotaUpdate', handleQuotaUpdate);
      window.removeEventListener('mercenaryUpdate', handleMercenaryUpdate);
    };
  }, [fetchMercenaries]);

  // Function to refresh all data when mercenaries change
  const refreshQuotaData = useCallback(async () => {
    try {
      // Refresh registrations data
      const response = await fetch(`/api/registrations?bossDate=${encodeURIComponent(selectedDate)}`);
      if (response.ok) {
        const data = await response.json();
        // This will trigger the useQuotaUpdates hook to update
        // We need to force a re-render by updating the date slightly
        setSelectedDate(prev => prev);
      }
      
      // Refresh mercenaries data
      await fetchMercenaries();
    } catch (error) {
      console.error('Failed to refresh quota data:', error);
    }
  }, [selectedDate, fetchMercenaries]);

  // Date navigation helpers
  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const goToNextMonday = () => {
    setSelectedDate(getNextMonday());
  };

  const initializeRegistrations = async () => {
    if (isInitializing) return; // Prevent multiple clicks
    
    try {
      setIsInitializing(true);
      console.log('Initializing registrations for all guilds:', guilds.length);
      console.log('Selected date:', selectedDate);
      
      // First, clean up any existing duplicates
      try {
        const cleanupResponse = await fetch('/api/cleanup-duplicates', { method: 'POST' });
        if (!cleanupResponse.ok) {
          console.warn('Failed to cleanup duplicates:', await cleanupResponse.text());
        } else {
        console.log('Cleaned up existing duplicates');
        }
      } catch (error) {
        console.warn('Failed to cleanup duplicates:', error);
        // Continue with initialization even if cleanup fails
      }
      
      // Create registrations for ALL guilds if they don't exist
      // Use Promise.all to create all registrations in parallel, which is safer with the new ON CONFLICT logic
      const registrationPromises = guilds.map(async (guild) => {
        const existingRegistration = registrations.find(r => r.guild_id === guild.id);
        if (!existingRegistration) {
          console.log('Creating registration for guild:', guild.name);
          const response = await fetch('/api/registrations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guild_id: guild.id,
              registration_code: '', // Will be fetched from guild table in the database
              used_quotas: 0,
              boss_date: selectedDate
            })
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to create registration for guild ${guild.name}:`, errorText);
            return null;
          }
          return await response.json();
        } else {
          console.log('Registration already exists for guild:', guild.name);
        }
        return null;
      });
      
      const results = await Promise.all(registrationPromises);
      const successful = results.filter(r => r !== null);
      console.log(`Registrations initialized: ${successful.length} created, real-time updates will handle the refresh`);
    } catch (error) {
      console.error('Failed to initialize registrations:', error);
      alert('Failed to initialize registrations. Please check the console for details.');
    } finally {
      setIsInitializing(false);
    }
  };

  const updateQuotas = useCallback(async (registrationId: string, newQuotas: number) => {
    try {
      setSaving(prev => ({ ...prev, [registrationId]: true }));
      
      // Use the simple quota update without optimistic locking
      // The quota should always match the actual mercenary count
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usedQuotas: newQuotas })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quotas');
      }
      
      // Real-time updates will handle refreshing the data
    } catch (error) {
      console.error('Failed to update quotas:', error);
      // Don't show alert for quota update failures, just log and continue
      console.warn('Quota update failed, will refresh data to sync:', error);
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

  const addMercenary = useCallback(async (guildId: string, name: string) => {
    try {
      // Find the registration for this guild and date
      const registration = registrations.find(r => r.guild_id === guildId);
      if (!registration) {
        throw new Error('No registration found for this guild');
      }

      const response = await fetch(`/api/mercenaries/${registration.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add mercenary');
      }
      
      const newMercenary = await response.json();
      // Update local state immediately for UI responsiveness
      setMercenaries(prev => [...prev, newMercenary]);
      
      // Calculate the new quota count based on actual mercenary count
      const guildMercenaries = [...mercenaries.filter(m => m.registration_id === registration.id), newMercenary];
      const newQuotaCount = guildMercenaries.length;
      
      // Update quota to match the actual mercenary count
      await updateQuotas(registration.id, newQuotaCount);
      
      // Broadcast SSE event for real-time updates
      try {
        await fetch('/api/events/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'mercenary_added',
            data: { registrationId: registration.id, mercenaryName: name }
          })
        });
      } catch (error) {
        console.warn('Failed to broadcast SSE event:', error);
      }
      
      // Always refresh data after a short delay to ensure consistency
      setTimeout(async () => {
        await refreshQuotaData();
      }, 100);
    } catch (error) {
      console.error('Failed to add mercenary:', error);
      // Refresh data to ensure consistency
      await refreshQuotaData();
    }
  }, [registrations, mercenaries, updateQuotas, refreshQuotaData]);

  const removeMercenary = useCallback(async (mercenaryId: string) => {
    // Prevent rapid-fire operations
    if (operationInProgress.has(mercenaryId)) {
      console.log('Operation already in progress for mercenary:', mercenaryId);
      return;
    }
    
    setOperationInProgress(prev => new Set(prev).add(mercenaryId));
    
    try {
      const response = await fetch(`/api/mercenaries/${mercenaryId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove mercenary');
      }
      
      // Find the mercenary to get the registration ID
      const mercenary = mercenaries.find(m => m.id === mercenaryId);
      if (mercenary) {
        // Update local state immediately for UI responsiveness
        setMercenaries(prev => prev.filter(m => m.id !== mercenaryId));
        
        // Calculate the new quota count based on remaining mercenaries
        const remainingMercenaries = mercenaries.filter(m => m.registration_id === mercenary.registration_id && m.id !== mercenaryId);
        const newQuotaCount = remainingMercenaries.length;
        
        // Update quota to match the actual mercenary count
        // This is a simple update without optimistic locking since quota should match mercenary count
        await updateQuotas(mercenary.registration_id, newQuotaCount);
        
        // Broadcast SSE event for real-time updates
        try {
          await fetch('/api/events/broadcast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'mercenary_removed',
              data: { registrationId: mercenary.registration_id, mercenaryId }
            })
          });
        } catch (error) {
          console.warn('Failed to broadcast SSE event:', error);
        }
        
        // Always refresh data after a short delay to ensure consistency
        setTimeout(async () => {
          await refreshQuotaData();
        }, 100);
      }
    } catch (error) {
      console.error('Failed to remove mercenary:', error);
      // Refresh data to ensure consistency
      await refreshQuotaData();
    } finally {
      // Clear the operation in progress flag
      setOperationInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(mercenaryId);
        return newSet;
      });
    }
  }, [mercenaries, registrations, updateQuotas, refreshQuotaData, operationInProgress]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-foreground">{t.common.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Connection Error</div>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={reconnect}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Reconnect
        </button>
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
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t.tracker.noRegistrations}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t.tracker.noRegistrationsSubtitle}
        </p>
        <button
          onClick={initializeRegistrations}
          disabled={isInitializing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInitializing ? 'Initializing...' : t.tracker.initializeRegistrations}
        </button>
      </div>
    );
  }

  const totalUsedQuotas = filteredRegistrations.reduce((sum, r) => sum + r.used_quotas, 0);
  const totalAvailableQuotas = selectedGuilds.reduce((sum, g) => sum + g.mercenary_quotas, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="border-b border-border pb-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">{t.tracker.title}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{currentTime}</span>
            {isConnected ? (
              <span className="text-green-600">●</span>
            ) : (
              <span className="text-red-600">●</span>
            )}
          </div>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 hover:bg-muted rounded"
            title="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 hover:bg-muted rounded"
            title="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <span className="text-sm text-muted-foreground ml-2">
            {formatDate(selectedDate)}
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          ลงทะเบียนทหาร
        </button>
      </div>

      {/* Guild Selector Section */}
      <div className="mb-6">
        <GuildSelector
          guilds={guilds}
          selectedGuildIds={selectedGuildIds}
          onSelectionChange={(newSelection) => {
            console.log('QuotaTracker received selection change:', newSelection);
            setSelectedGuildIds(newSelection);
          }}
          placeholder={t.tracker.selectGuilds}
        />
        {selectedGuildIds.length > 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            {selectedGuildIds.length} guild{selectedGuildIds.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {selectedGuildIds.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-sm font-medium text-foreground">{t.tracker.noGuildsSelected}</h3>
          <p className="text-sm text-muted-foreground">
            Select guilds above to track their quota usage
          </p>
        </div>
      ) : (
        <>
          {/* Overall Quota Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 border border-border rounded">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalUsedQuotas}</div>
              <div className="text-xs text-muted-foreground">{t.tracker.usedQuotas}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalAvailableQuotas - totalUsedQuotas}</div>
              <div className="text-xs text-muted-foreground">{t.tracker.availableQuotas}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{totalAvailableQuotas}</div>
              <div className="text-xs text-muted-foreground">{t.tracker.totalQuotas}</div>
            </div>
          </div>

          {/* Guild Quota Breakdown */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quota by Guild</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrations.map((registration) => {
                const guild = guilds.find(g => g.id === registration.guild_id);
                if (!guild) return null;
                
                return (
                  <div key={registration.id} className="border border-border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{guild.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        {registration.used_quotas} / {guild.mercenary_quotas}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      {registration.registration_code}
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${guild.mercenary_quotas > 0 ? (registration.used_quotas / guild.mercenary_quotas) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {guild.mercenary_quotas - registration.used_quotas} remaining
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mercenaries Table */}
          <MercenariesTable
            mercenaries={mercenaries}
            guilds={guilds}
            registrations={registrations}
            onRemoveMercenary={removeMercenary}
            isLoading={loading}
          />

        </>
      )}

      {/* Add Mercenary Modal */}
      <AddMercenaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guilds={guilds}
        registrations={registrations}
        onAddMercenary={addMercenary}
      />
    </div>
  );
}
