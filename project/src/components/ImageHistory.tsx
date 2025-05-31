import React from 'react';
import { Clock } from 'lucide-react';
import { HistoryItem } from '../types';

interface ImageHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

function ImageHistory({ history, onSelect }: ImageHistoryProps) {
  return (
    <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-8 border border-white/20">
      <div className="flex items-center mb-6">
        <Clock className="w-6 h-6 text-gray-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Generation History</h2>
      </div>
      
      {history.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No history yet</p>
      ) : (
        <div className="grid gap-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-4 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/80 transition-all cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => onSelect(item)}
            >
              <img
                src={item.image}
                alt="Generated bird"
                className="w-24 h-24 object-cover rounded-lg shadow-md"
              />
              <div>
                <p className="text-sm text-gray-700 mb-2">{item.prompt}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageHistory;