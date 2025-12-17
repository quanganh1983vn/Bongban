import React from 'react';
import { Rank } from '../types';

interface RankBadgeProps {
  rank: string;
  className?: string;
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, className = '' }) => {
  const getColors = (r: string) => {
    switch (r) {
      case 'A': return 'bg-red-600 text-white border-red-700';
      case 'B': return 'bg-orange-500 text-white border-orange-600';
      case 'C': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
      case 'D': return 'bg-green-500 text-white border-green-600';
      case 'E': return 'bg-teal-500 text-white border-teal-600';
      case 'F': return 'bg-blue-500 text-white border-blue-600';
      case 'G': return 'bg-indigo-500 text-white border-indigo-600';
      case 'H': return 'bg-gray-500 text-white border-gray-600';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 shadow-sm ${getColors(rank)} ${className}`}>
      {rank}
    </span>
  );
};

export default RankBadge;
