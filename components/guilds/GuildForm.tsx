'use client';

import { useState } from 'react';
import { Guild } from '@/lib/db';
import { generateRegistrationCode } from '@/lib/utils';
import { X, Save } from 'lucide-react';

interface GuildFormProps {
  guild?: Guild;
  onSave: (guild: Omit<Guild, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export default function GuildForm({ guild, onSave, onCancel }: GuildFormProps) {
  const [formData, setFormData] = useState({
    name: guild?.name || '',
    registration_code: guild?.registration_code || generateRegistrationCode(),
    mercenary_quotas: guild?.mercenary_quotas || 0,
    contact_info: guild?.contact_info || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Guild name is required';
    }

    if (!formData.registration_code.trim()) {
      newErrors.registration_code = 'Registration code is required';
    }

    if (formData.mercenary_quotas < 0) {
      newErrors.mercenary_quotas = 'Mercenary quotas must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const generateNewCode = () => {
    setFormData(prev => ({ ...prev, registration_code: generateRegistrationCode() }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {guild ? 'Edit Guild' : 'Add New Guild'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Guild Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter guild name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="registration_code" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Code *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="registration_code"
                value={formData.registration_code}
                onChange={(e) => setFormData(prev => ({ ...prev, registration_code: e.target.value.toUpperCase() }))}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.registration_code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter registration code"
                maxLength={10}
              />
              <button
                type="button"
                onClick={generateNewCode}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Generate
              </button>
            </div>
            {errors.registration_code && <p className="text-red-500 text-sm mt-1">{errors.registration_code}</p>}
          </div>

          <div>
            <label htmlFor="mercenary_quotas" className="block text-sm font-medium text-gray-700 mb-1">
              Mercenary Quotas *
            </label>
            <input
              type="number"
              id="mercenary_quotas"
              value={formData.mercenary_quotas}
              onChange={(e) => setFormData(prev => ({ ...prev, mercenary_quotas: parseInt(e.target.value) || 0 }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mercenary_quotas ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter number of mercenary quotas"
              min="0"
            />
            {errors.mercenary_quotas && <p className="text-red-500 text-sm mt-1">{errors.mercenary_quotas}</p>}
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Information
            </label>
            <textarea
              id="contact_info"
              value={formData.contact_info}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_info: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Discord username, in-game name, etc."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4" />
              {guild ? 'Update Guild' : 'Add Guild'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
