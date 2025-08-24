import { Trophy, CheckCircle, Eye, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
  const handleContact = (candidateName: string) => {
    setIsContactDialogOpen(true);
  };
  
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
    <>
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsViewDialogOpen(true)}
        >
          <Eye className="w-4 h-4 mr-1" />
          View Profile
        </Button>
        <Button size="sm" onClick={() => handleContact(name)}>
          <Mail className="w-4 h-4 mr-1" />
          Contact
        </Button>
      </div>
    </div>

    {/* Detailed Profile Dialog */}
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${getRankColor(rank)} text-white rounded-full flex items-center justify-center font-medium text-sm`}>
              {rank}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{name}</h3>
              <p className="text-sm text-gray-600">{role}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">{overallScore}%</div>
            <p className="text-sm text-gray-600">Overall Match Score</p>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">{skillsMatch}%</div>
              <p className="text-sm text-gray-600">Skills Match</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${skillsMatch}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">{experienceMatch}%</div>
              <p className="text-sm text-gray-600">Experience Match</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${experienceMatch}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">{contextMatch}%</div>
              <p className="text-sm text-gray-600">Context Match</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${contextMatch}%` }}
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Matched Skills</h4>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Experience</h4>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {experience}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Contact Candidate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Contact Dialog */}
    <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>Contact {name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Ready to reach out to <strong>{name}</strong>?
            </p>
            <p className="text-xs text-blue-600 mt-1">
              {role} • {overallScore}% Match
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Job Opportunity - [Position]"
                defaultValue={`Job Opportunity - ${role} Position`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Hi [Name], I'm reaching out regarding..."
                defaultValue={`Hi ${name},\n\nI'm reaching out regarding the ${role} position at our company. Your profile shows a strong match with our requirements, and I'd love to discuss this opportunity with you.\n\nBest regards,\n[Your Name]`}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Here you would integrate with your email service
              alert('Contact functionality would be integrated with your email service');
              setIsContactDialogOpen(false);
            }}>
              <Mail className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
