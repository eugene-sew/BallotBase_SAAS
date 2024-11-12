import React from 'react';
import type { Portfolio, Candidate } from '../types';

interface VotingStepProps {
  portfolio: Portfolio & { candidates: Candidate[] };
  onVote: (portfolioId: string, candidateId: string) => void;
  totalSteps: number;
  currentStep: number;
  selectedCandidate?: string;
}

export const VotingStep: React.FC<VotingStepProps> = ({
  portfolio,
  onVote,
  totalSteps,
  currentStep,
  selectedCandidate,
}) => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / totalSteps) * 100}%`,
            }}
          />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">{portfolio.title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {portfolio.candidates.map((candidate) => (
          <button
            key={candidate.id}
            onClick={() => onVote(portfolio.id, candidate.id)}
            className={`p-4 border-2 rounded-lg transition-colors ${
              selectedCandidate === candidate.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary'
            }`}
          >
            {candidate.image_url && (
              <img
                src={candidate.image_url}
                alt={candidate.name}
                className="w-32 h-32 mx-auto rounded-full mb-4 object-cover"
              />
            )}
            <h3 className="text-lg font-medium">{candidate.name}</h3>
            {portfolio.isYesNo && (
              <p className="text-sm text-gray-500 mt-2">
                Click to vote {candidate.name === 'Yes' ? 'YES' : 'NO'}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export const VotingStepSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
<div className="mb-6 animate-pulse">
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm bg-gray-200 rounded w-1/4"></span>
    <span className="text-sm bg-gray-200 rounded w-1/4"></span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div className="bg-primary rounded-full h-2 transition-all duration-300 w-full"></div>
  </div>
</div>

<div className="h-6 font-bold mb-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
    
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
     { [1,2,3,4].map(()=> <div className="p-4 border-2 rounded-lg animate-pulse">
  <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 mb-4"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  <div className="mt-2 h-4 bg-gray-200 rounded w-2/3"></div>
</div>)}
    </div>
    </div>
    </div>
  );
};