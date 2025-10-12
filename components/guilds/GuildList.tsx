'use client';

import { useState } from 'react';
import { Guild } from '@/lib/db';
import { Edit, Trash2, Users, Hash, MessageSquare } from 'lucide-react';

interface GuildListProps {
  guilds: Guild[];
  onEdit: (guild: Guild) => void;
  onDelete: (id: string) => void;
}

export default function GuildList({ guilds, onEdit, onDelete }: GuildListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  if (guilds.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">No guilds</h3>
        <p className="mt-1 text-sm text-muted-foreground">Get started by adding your first guild.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guilds.map((guild) => (
        <div key={guild.id} className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {guild.name}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium">Registration Code:</span>
                    <div className="mt-1">
                      <code className="bg-muted px-2 py-1 rounded text-xs font-mono break-all">
                        {guild.registration_code}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Mercenary Quotas:</span>
                  <span className="font-semibold text-blue-600">
                    {guild.mercenary_quotas}
                  </span>
                </div>
              </div>

              {guild.contact_info && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 mt-0.5" />
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-muted-foreground">{guild.contact_info}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(guild)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                title="Edit guild"
              >
                <Edit className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => handleDelete(guild.id)}
                className={`p-2 rounded-md transition-colors ${
                  deleteConfirm === guild.id
                    ? 'text-destructive bg-destructive/10 hover:bg-destructive/20'
                    : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                }`}
                title={deleteConfirm === guild.id ? 'Click again to confirm' : 'Delete guild'}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {deleteConfirm === guild.id && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">
                Are you sure you want to delete this guild? This action cannot be undone.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
