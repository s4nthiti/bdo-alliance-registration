'use client';

import { Mercenary, Guild, Registration } from '@/lib/db';
import { X, Clock } from 'lucide-react';

interface MercenariesTableProps {
  mercenaries: (Mercenary & { guild_name: string; registration_code: string })[];
  guilds: Guild[];
  registrations: (Registration & { guild_name: string })[];
  onRemoveMercenary: (mercenaryId: string) => void;
  isLoading?: boolean;
}

export default function MercenariesTable({ 
  mercenaries, 
  guilds, 
  registrations,
  onRemoveMercenary, 
  isLoading = false 
}: MercenariesTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading mercenaries...</p>
      </div>
    );
  }

  if (mercenaries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No mercenaries registered yet</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Guild
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Registration Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Mercenary Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Registered At
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {mercenaries.map((mercenary) => {
              const registration = registrations.find(r => r.id === mercenary.registration_id);
              const guild = guilds.find(g => g.id === registration?.guild_id);
              
              return (
                <tr key={mercenary.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm text-foreground">
                    {mercenary.guild_name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {mercenary.registration_code}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {mercenary.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(mercenary.registered_at).toLocaleString('th-TH', {
                        timeZone: 'Asia/Bangkok',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onRemoveMercenary(mercenary.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Remove mercenary"
                    >
                      ยกเลิกทหาร
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
