'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { Guild } from '@/lib/db';
import GuildForm from '@/components/guilds/GuildForm';
import GuildList from '@/components/guilds/GuildList';
import MessageGenerator from '@/components/dashboard/MessageGenerator';
import QuotaTracker from '@/components/dashboard/QuotaTracker';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeSwitcher';
import { Plus, Users, MessageSquare, BarChart3, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGuildForm, setShowGuildForm] = useState(false);
  const [editingGuild, setEditingGuild] = useState<Guild | null>(null);
  const [activeTab, setActiveTab] = useState<'guilds' | 'message' | 'tracker'>('guilds');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      // Initialize database via API route
      const initResponse = await fetch('/api/init-db', { method: 'POST' });
      if (!initResponse.ok) {
        throw new Error('Failed to initialize database');
      }
      await loadGuilds();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuilds = async () => {
    try {
      const response = await fetch('/api/guilds');
      if (!response.ok) {
        throw new Error('Failed to load guilds');
      }
      const data = await response.json();
      setGuilds(data);
    } catch (error) {
      console.error('Failed to load guilds:', error);
    }
  };

  const handleSaveGuild = async (guildData: Omit<Guild, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingGuild) {
        const response = await fetch(`/api/guilds/${editingGuild.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guildData)
        });
        if (!response.ok) throw new Error('Failed to update guild');
      } else {
        const response = await fetch('/api/guilds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(guildData)
        });
        if (!response.ok) throw new Error('Failed to create guild');
      }
      await loadGuilds();
      setShowGuildForm(false);
      setEditingGuild(null);
    } catch (error) {
      console.error('Failed to save guild:', error);
    }
  };

  const handleEditGuild = (guild: Guild) => {
    setEditingGuild(guild);
    setShowGuildForm(true);
  };

  const handleDeleteGuild = async (id: string) => {
    try {
      const response = await fetch(`/api/guilds/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete guild');
      await loadGuilds();
    } catch (error) {
      console.error('Failed to delete guild:', error);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {t.auth.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground">
                {t.auth.welcome}, {user?.username}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground px-3 py-2 rounded-md hover:bg-accent"
              >
                <LogOut className="h-4 w-4" />
                {t.auth.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('guilds')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'guilds'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t.nav.guildManagement}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('message')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'message'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t.nav.messageGenerator}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('tracker')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracker'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t.nav.quotaTracker}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'guilds' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t.guilds.title}</h2>
                <p className="text-muted-foreground">{t.guilds.subtitle}</p>
              </div>
              <button
                onClick={() => setShowGuildForm(true)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium"
              >
                <Plus className="h-4 w-4" />
                {t.guilds.addGuild}
              </button>
            </div>

            <GuildList
              guilds={guilds}
              onEdit={handleEditGuild}
              onDelete={handleDeleteGuild}
            />
          </div>
        )}

        {activeTab === 'message' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.message.title}</h2>
              <p className="text-muted-foreground">{t.message.subtitle}</p>
            </div>
            <MessageGenerator guilds={guilds} />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.tracker.title}</h2>
              <p className="text-muted-foreground">{t.tracker.subtitle}</p>
            </div>
            <QuotaTracker guilds={guilds} />
          </div>
        )}
      </main>

      {/* Guild Form Modal */}
      {showGuildForm && (
        <GuildForm
          guild={editingGuild || undefined}
          onSave={handleSaveGuild}
          onCancel={() => {
            setShowGuildForm(false);
            setEditingGuild(null);
          }}
        />
      )}
    </div>
  );
}
