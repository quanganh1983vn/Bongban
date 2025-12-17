import React from 'react';
import { Athlete } from '../types';
import RankBadge from './RankBadge';
import { Trophy, Users } from 'lucide-react';

interface AthleteCardProps {
  athlete: Athlete;
  rank: string;
}

const AthleteCard: React.FC<AthleteCardProps> = ({ athlete, rank }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute -bottom-10 left-4">
          <img 
            src={athlete.avatarUrl} 
            alt={athlete.name} 
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md bg-gray-200"
          />
        </div>
        <div className="absolute top-3 right-3">
          <RankBadge rank={rank} />
        </div>
      </div>
      <div className="pt-12 pb-4 px-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{athlete.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Users className="w-3 h-3 mr-1" />
              <span>{athlete.team}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xl font-bold text-indigo-600">{athlete.points}</span>
            <span className="text-xs text-gray-400 uppercase font-semibold">Điểm</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold mr-1">Trận:</span> {athlete.matchesPlayed}
          </div>
          <div className="flex items-center text-green-600">
            <Trophy className="w-3 h-3 mr-1" />
            <span className="font-bold">{athlete.wins}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteCard;
