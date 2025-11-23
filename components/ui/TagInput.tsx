'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import ChefiniButton from './ChefiniButton';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
}

export default function TagInput({ tags, setTags, placeholder }: TagInputProps) {
  const [input, setInput] = useState('');
  
  const addTag = () => {
    if (input.trim() && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput('');
    }
  };
  
  return (
    <div className="border-4 border-black p-4 bg-white shadow-brutal">
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-chefini-yellow text-black"
        />
        <ChefiniButton onClick={addTag} icon={Plus}>Add</ChefiniButton>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div key={idx} className="bg-chefini-yellow px-3 py-1 border-2 border-black font-bold flex items-center gap-2 text-black">
            {tag}
            <X size={16} className="cursor-pointer" onClick={() => setTags(tags.filter((_, i) => i !== idx))} />
          </div>
        ))}
      </div>
    </div>
  );
}