'use client';

import { useState } from 'react';
import { Guild, Mercenary, Registration } from '@/lib/db';
import { X, Plus, Loader2, Users } from 'lucide-react';

interface AddMercenaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  guilds: Guild[];
  registrations: (Registration & { guild_name: string })[];
  onAddMercenary: (guildId: string, name: string) => Promise<void>;
}

export default function AddMercenaryModal({ 
  isOpen, 
  onClose, 
  guilds, 
  registrations,
  onAddMercenary 
}: AddMercenaryModalProps) {
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [mercenaryName, setMercenaryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuildId || !mercenaryName.trim()) return;

    try {
      setIsAdding(true);
      await onAddMercenary(selectedGuildId, mercenaryName.trim());
      setMercenaryName('');
      setSelectedGuildId('');
      onClose();
    } catch (error) {
      console.error('Failed to add mercenary:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setMercenaryName('');
      setSelectedGuildId('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="relative bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
        
        {/* Content */}
        <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-xl shadow-lg">
              <Plus className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Mercenary</h2>
              <p className="text-sm text-white/60">Register a new mercenary</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isAdding}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200 disabled:opacity-50 group"
          >
            <X className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <Users className="h-4 w-4 text-purple-300" />
              </div>
              <label className="text-sm font-semibold text-white/90">
                Select Guild
              </label>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <select
                value={selectedGuildId}
                onChange={(e) => setSelectedGuildId(e.target.value)}
                className="relative w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 backdrop-blur-sm group-hover:bg-white/15 group-hover:border-white/30 cursor-pointer"
                required
              >
                <option value="" className="bg-gray-800/90 text-white py-2">
                  Choose a guild...
                </option>
                {guilds.map((guild) => {
                  const registration = registrations.find(r => r.guild_id === guild.id);
                  const quotaUsed = registration?.used_quotas || 0;
                  const quotaTotal = guild.mercenary_quotas;
                  
                  return (
                    <option key={guild.id} value={guild.id} className="bg-gray-800/90 text-white py-2">
                      {guild.name} {registration?.registration_code && `(${registration.registration_code})`} - {quotaUsed}/{quotaTotal}
                    </option>
                  );
                })}
              </select>
              
              {/* Custom Dropdown Arrow */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/60"></div>
              </div>
            </div>
            
            {/* Guild Info Display */}
            {selectedGuildId && (
              <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
                {(() => {
                  const selectedGuild = guilds.find(g => g.id === selectedGuildId);
                  const registration = registrations.find(r => r.guild_id === selectedGuildId);
                  if (!selectedGuild || !registration) return null;
                  
                  const quotaUsed = registration.used_quotas;
                  const quotaTotal = selectedGuild.mercenary_quotas;
                  const quotaPercentage = quotaTotal > 0 ? Math.round((quotaUsed / quotaTotal) * 100) : 0;
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white/80">Quota Usage</span>
                        <span className="text-sm text-white/60">{quotaUsed}/{quotaTotal}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${quotaPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Registration: {registration.registration_code}</span>
                        <span>{quotaPercentage}% used</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white/90 mb-3">
              Mercenary Name
            </label>
            <div className="relative group">
              <input
                type="text"
                value={mercenaryName}
                onChange={(e) => setMercenaryName(e.target.value)}
                placeholder="Enter mercenary name..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm group-hover:bg-white/15"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isAdding}
              className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedGuildId || !mercenaryName.trim() || isAdding}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Mercenary
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
