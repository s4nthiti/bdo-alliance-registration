'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { Guild, Registration, Mercenary } from '@/lib/db';
import { getNextMonday, formatDate } from '@/lib/utils';
import { useLanguage } from '@/components/LanguageProvider';
import GuildSelector from '@/components/GuildSelector';
import { useQuotaUpdates } from '@/lib/useQuotaUpdates';
import { useSSE } from '@/lib/useSSE';
import { Users, Plus, Minus, Save, Calendar, Loader2, Wifi, WifiOff, RefreshCw, ChevronLeft, ChevronRight, User, X, Clock, BarChart3 } from 'lucide-react';

interface QuotaTrackerProps {
  guilds: Guild[];
}

// Memoized component for individual quota items
const QuotaItem = memo(({ 
  registration, 
  guild, 
  isSaving, 
  onAdjustQuotas,
  mercenaries,
  onAddMercenary,
  onRemoveMercenary
}: {
  registration: Registration & { guild_name: string };
  guild: Guild;
  isSaving: boolean;
  onAdjustQuotas: (id: string, delta: number) => void;
  mercenaries: (Mercenary & { guild_name: string; registration_code: string })[];
  onAddMercenary: (registrationId: string, name: string) => void;
  onRemoveMercenary: (mercenaryId: string) => void;
}) => {
  const isAtMax = registration.used_quotas >= guild.mercenary_quotas;
  const { t } = useLanguage();
  const [mercenaryName, setMercenaryName] = useState('');
  const [isAddingMercenary, setIsAddingMercenary] = useState(false);

  const guildMercenaries = mercenaries.filter(m => m.registration_id === registration.id);

  const handleAddMercenary = async () => {
    if (!mercenaryName.trim()) return;
    
    try {
      setIsAddingMercenary(true);
      await onAddMercenary(registration.id, mercenaryName.trim());
      setMercenaryName('');
    } catch (error) {
      console.error('Failed to add mercenary:', error);
    } finally {
      setIsAddingMercenary(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">{registration.guild_name}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            <code className="bg-muted px-3 py-1 rounded-lg text-xs font-mono break-all">
              {registration.registration_code}
            </code>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {registration.used_quotas} / {guild.mercenary_quotas}
          </div>
          <div className="text-sm text-muted-foreground">quotas</div>
        </div>
      </div>

      {/* Quota Display */}
      <div className="bg-muted/50 rounded-lg p-4 mb-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground mb-1">
            {registration.used_quotas}
          </div>
          <div className="text-sm text-muted-foreground">Current Quota</div>
        </div>
        </div>

      {/* Mercenary Name Input */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-semibold text-foreground">Add Mercenary</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={mercenaryName}
            onChange={(e) => setMercenaryName(e.target.value)}
            placeholder="Enter mercenary name..."
            className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAddMercenary()}
          />
        <button
            onClick={handleAddMercenary}
            disabled={!mercenaryName.trim() || isAddingMercenary || isAtMax}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors shadow-sm"
          >
            {isAddingMercenary ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
          <Plus className="h-4 w-4" />
            )}
            Add
        </button>
        </div>
      </div>

      {/* Mercenaries List */}
      {guildMercenaries.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="font-semibold text-foreground">Registered Mercenaries</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
              {guildMercenaries.length}
            </span>
          </div>
          <div className="space-y-2">
            {guildMercenaries.map((mercenary) => (
              <div key={mercenary.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-foreground">{mercenary.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(mercenary.registered_at).toLocaleTimeString()}
                  </span>
                  <button
                    onClick={() => onRemoveMercenary(mercenary.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Remove mercenary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSaving && (
        <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Saving changes...</span>
        </div>
      )}

      {isAtMax && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded">
              <Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
            {t.tracker.quotaLimitMessage}
          </p>
          </div>
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
              registration_code: guild.registration_code,
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

  const addMercenary = useCallback(async (registrationId: string, name: string) => {
    try {
      const response = await fetch(`/api/mercenaries/${registrationId}`, {
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
      const guildMercenaries = [...mercenaries.filter(m => m.registration_id === registrationId), newMercenary];
      const newQuotaCount = guildMercenaries.length;
      
      // Update quota to match the actual mercenary count
      // This is a simple update without optimistic locking since quota should match mercenary count
      await updateQuotas(registrationId, newQuotaCount);
      
      // Broadcast SSE event for real-time updates
      try {
        await fetch('/api/events/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'mercenary_added',
            data: { registrationId, mercenaryName: name }
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
  }, [mercenaries, updateQuotas, refreshQuotaData]);

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
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.tracker.title}</h2>
              <p className="text-sm text-muted-foreground">Track mercenary registrations in real-time</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg font-medium text-foreground">{t.common.loading}</p>
            <p className="mt-2 text-sm text-muted-foreground">Loading quota data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.tracker.title}</h2>
              <p className="text-sm text-muted-foreground">Track mercenary registrations in real-time</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-red-200 dark:border-red-800 rounded-xl p-8 shadow-sm">
        <div className="text-center">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">Connection Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-6">{error}</p>
          <button
            onClick={reconnect}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 mx-auto transition-colors shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Reconnect
          </button>
          </div>
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
      </div>

      {/* Date Picker Section */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            {t.tracker.bossDate}
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 bg-background border border-border rounded-md hover:bg-muted transition-colors"
            title="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 bg-background border border-border rounded-md hover:bg-muted transition-colors"
            title="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {formatDate(selectedDate)}
        </div>
      </div>

        <div className="text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t.tracker.noRegistrations}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t.tracker.noRegistrationsSubtitle}
          </p>
          <button
            onClick={initializeRegistrations}
            disabled={isInitializing}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isInitializing && <Loader2 className="h-4 w-4 animate-spin" />}
            {isInitializing ? 'Initializing...' : t.tracker.initializeRegistrations}
          </button>
        </div>
      </div>
    );
  }

  const totalUsedQuotas = filteredRegistrations.reduce((sum, r) => sum + r.used_quotas, 0);
  const totalAvailableQuotas = selectedGuilds.reduce((sum, g) => sum + g.mercenary_quotas, 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.tracker.title}</h2>
              <p className="text-sm text-muted-foreground">Track mercenary registrations in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Current Time Display */}
            <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-lg border border-border/50">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono text-foreground">
                {currentTime}
              </span>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-background/50 rounded-lg">
              {isConnected && sseConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live (SSE)</span>
                </>
              ) : isConnected ? (
                <>
                  <Wifi className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Polling</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Date Picker Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <label className="text-lg font-semibold text-foreground">
              {t.tracker.bossDate}
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-3 bg-background border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
            title="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex-1">
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium opacity-0 absolute inset-0 z-10"
              />
              <div className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground text-center font-medium">
                {selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('th-TH', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : 'DD/MM/YYYY'}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-3 bg-background border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
            title="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {formatDate(selectedDate)}
            </span>
          </div>
          
        </div>
      </div>

      {/* Guild Selector Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-purple-600" />
          <label className="text-lg font-semibold text-foreground">
          {t.tracker.selectGuilds}
        </label>
        </div>
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
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>{selectedGuildIds.length}</strong> guild{selectedGuildIds.length !== 1 ? 's' : ''} selected for tracking
            </p>
          </div>
        )}
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
          {/* Quota Summary */}
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-foreground">Quota Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalUsedQuotas}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">{t.tracker.usedQuotas}</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">{totalAvailableQuotas - totalUsedQuotas}</div>
                <div className="text-sm text-green-700 dark:text-green-300 font-medium">{t.tracker.availableQuotas}</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-3xl font-bold text-slate-600 dark:text-slate-400 mb-1">{totalAvailableQuotas}</div>
                <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.tracker.totalQuotas}</div>
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
              mercenaries={mercenaries}
              onAddMercenary={addMercenary}
              onRemoveMercenary={removeMercenary}
            />
          );
        })}
      </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  {t.tracker.instructions}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t.tracker.instructionsMessage}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
