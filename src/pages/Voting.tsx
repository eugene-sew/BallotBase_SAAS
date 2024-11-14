import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { VotingStep, VotingStepSkeleton } from '../components/VotingStep';
import type { Portfolio, Candidate } from '../types';

export const Voting: React.FC = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const voterId = sessionStorage.getItem('voter_id');
  const [isSubmitting,setIsSubmitting] = useState(false)

  const { data: portfolios, isLoading } = useQuery<
    (Portfolio & { candidates: Candidate[] })[]
  >(['portfolios', electionId], async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select(
        `
        *,
        candidates (*)
      `
      )
      .eq('election_id', electionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  });

  useEffect(() => {
    const checkVoterStatus = async () => {
      if (!voterId) {
        navigate(`/vote/${electionId}/auth`);
        return;
      }

      try {
        const { data: voterData, error: voterCheckError } = await supabase
          .from('voters')
          .select('has_voted')
          .eq('id', voterId)
          .single();

        if (voterCheckError) throw voterCheckError;

        if (voterData?.has_voted) {
          toast.error('You have already voted!');
          navigate('/'); // Redirect to home page
        }
      } catch (error) {
        toast.error('Failed to check voting status');
      }
    };

    checkVoterStatus();
  }, [voterId, electionId, navigate]);

  const handleVote = (portfolioId: string, candidateId: string) => {
    setVotes((prev) => ({ ...prev, [portfolioId]: candidateId }));
  };

  const handleNext = () => {
    const currentPortfolio = portfolios?.[currentStep];
    
    if (currentPortfolio) {
      if (currentPortfolio.candidates.length === 1) {
        
        setCurrentStep((prev) => prev + 1);
      } else if (currentStep < (portfolios?.length || 0) - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {

      const { data: voterData, error: voterCheckError } = await supabase
      .from('voters')
      .select('has_voted')
      .eq('id', voterId)
      .single();

    if (voterCheckError) throw voterCheckError;

    if (voterData?.has_voted) {
      toast.error('You have already voted!');
      navigate('/');
      return; 
    }
      // Submit all votes
      const votesData = Object.entries(votes).map(([portfolioId, candidateId]) => ({
        election_id: electionId,
        portfolio_id: portfolioId,
        candidate_id: candidateId,
        voter_id: voterId,
      }));

      const { error: votesError } = await supabase.from('votes').insert(votesData);
      if (votesError) throw votesError;

      // Mark voter as voted
      const { error: voterError } = await supabase
        .from('voters')
        .update({ has_voted: true })
        .eq('id', voterId);

      if (voterError) throw voterError;

      toast.success('Thank you for voting!');
      
      navigate(`/vote/${electionId}/thank-you`);
    } catch (error) {
      toast.error('Failed to submit votes');
    }
  };

  if (isLoading) {
    return <VotingStepSkeleton/>
  }


  const currentPortfolio = portfolios?.[currentStep];
  const isLastStep = currentStep === (portfolios?.length || 0) - 1;
  const hasVotedForCurrent = currentPortfolio 
    ? votes[currentPortfolio.id] !== undefined || currentPortfolio.candidates.length === 1
    : undefined;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentPortfolio && (
          <VotingStep
            portfolio={currentPortfolio}
            onVote={handleVote}
            totalSteps={portfolios?.length || 0}
            currentStep={currentStep}
            selectedCandidate={votes[currentPortfolio.id]}
          />
        )}

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Back
          </button>
          
          {isLastStep ? 

            !isSubmitting && <button
              type="button"
              onClick={handleSubmit}
              disabled={!hasVotedForCurrent}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              Submit Votes
            </button>
           : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasVotedForCurrent}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};