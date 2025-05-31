import React from 'react';
import { Lightbulb } from 'lucide-react';

const examplePrompts = [
  "A yellow bird with red crown black short beak and long tail",
];

interface ExamplePromptsProps {
  onSelect: (prompt: string) => void;
}

function ExamplePrompts({ onSelect }: ExamplePromptsProps) {
  return (
    <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Example Prompts</h2>
      </div>
      <div className="grid gap-3">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSelect(prompt)}
            className="text-left p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all text-sm text-gray-700 shadow-sm hover:shadow-md"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ExamplePrompts;