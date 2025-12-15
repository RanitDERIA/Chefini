'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ChefiniButton from './ChefiniButton';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
  onValidate?: (text: string) => Promise<{ valid: boolean, reason?: string }>;
  onError?: (msg: string) => void;
}

export default function TagInput({ tags, setTags, placeholder, onValidate, onError }: TagInputProps) {
  const [input, setInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const addTag = async () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      if (onValidate) {
        setIsValidating(true);
        const { valid, reason } = await onValidate(trimmed);
        setIsValidating(false);

        if (!valid) {
          onError?.(reason || 'Invalid input');
          return;
        }
      }

      setTags([...tags, trimmed]);
      setInput('');
    }
  };

  return (
    <div className="border-4 border-black p-3 sm:p-4 bg-white shadow-brutal w-full">
      {/* RESPONSIVE FIX: 
         flex-col on mobile (stack vertical), 
         sm:flex-row on desktop (side-by-side) 
      */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          placeholder={placeholder}
          // Added min-w-0 to prevent flex item overflow
          className="flex-1 min-w-0 px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-chefini-yellow text-black w-full"
        />
        <div className="sm:w-auto w-full">
          <ChefiniButton
            onClick={addTag}
            icon={Plus}
            disabled={isValidating}
            className="w-full justify-center sm:w-auto"
          >
            {isValidating ? 'Checking...' : 'Add'}
          </ChefiniButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="bg-chefini-yellow px-2 sm:px-3 py-1 border-2 border-black font-bold flex items-center gap-2 text-black text-sm sm:text-base animate-in fade-in zoom-in duration-200">
            <span className="break-all">{tag}</span>
            <X
              size={16}
              className="cursor-pointer hover:text-red-600 transition-colors flex-shrink-0"
              onClick={() => setTags(tags.filter((_, i) => i !== idx))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}