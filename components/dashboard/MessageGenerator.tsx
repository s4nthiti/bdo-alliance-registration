'use client';

import { useState } from 'react';
import { Guild } from '@/lib/db';
import { generateDiscordMessage, getNextMonday } from '@/lib/utils';
import { Copy, Download, MessageSquare, Calendar } from 'lucide-react';

interface MessageGeneratorProps {
  guilds: Guild[];
}

export default function MessageGenerator({ guilds }: MessageGeneratorProps) {
  const [copied, setCopied] = useState(false);
  const nextMonday = getNextMonday();

  const message = generateDiscordMessage(
    guilds.map(guild => ({
      name: guild.name,
      registration_code: guild.registration_code,
      mercenary_quotas: guild.mercenary_quotas
    }))
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdo-guild-message-${nextMonday}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (guilds.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No guilds available</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add some guilds first to generate the Discord message.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Discord Message Generator</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>Next Boss: {new Date(nextMonday).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {message}
          </pre>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
            copied
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied!' : 'Copy Message'}
        </button>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Download as Text
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Copy this message and send it to each guild's Discord channel or contact person. 
          The message contains all the necessary information for mercenaries to register for the boss fight.
        </p>
      </div>
    </div>
  );
}
