import { Trophy, CheckCircle, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchCardProps {
  rank: number;
  name: string;
  role: string;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  contextMatch: number;
  matchedSkills: string[];
  experience: string;
}

export default function MatchCard({
  rank,
  name,
  role,
  overallScore,
  skillsMatch,
  experienceMatch,
  contextMatch,
  matchedSkills,
  experience,
}: MatchCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-blue-500';
      case 3: return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-green-600';
      case 2: return 'text-blue-600';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="border rounded-lg p-4 hover:shadow-material-2 transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${getRankColor(rank)} text-white rounded-full flex items-center justify-center font-medium`}>
            {rank}
          </div>
          <div>
            <h5 className="font-medium text-gray-900">{name}</h5>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${getScoreColor(rank)}`}>
              {overallScore}%
            </span>
            <CheckCircle className={getScoreColor(rank)} />
          </div>
          <p className="text-xs text-gray-500">Match Score</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div>
          <p className="text-xs text-gray-500">Skills Match</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getRankColor(rank)}`}
              style={{ width: `${skillsMatch}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{skillsMatch}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Experience</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getRankColor(rank)}`}
              style={{ width: `${experienceMatch}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{experienceMatch}%</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Context</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getRankColor(rank)}`}
              style={{ width: `${contextMatch}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{contextMatch}%</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {matchedSkills.map((skill, index) => (
          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
            {skill}
          </span>
        ))}
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
          {experience}
        </span>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-1" />
          View Profile
        </Button>
        <Button size="sm">
          <Mail className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>
  );
}
