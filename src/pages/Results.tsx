import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { ResultsChart } from '../components/ResultsChart';
import { useAuth } from '../hooks/useAuth';
import type { Portfolio, Candidate, Vote, Election } from '../types';

export const Results: React.FC = () => {
  const { electionId } = useParams();
  const { user } = useAuth();
  const [isPublished, setIsPublished] = useState<boolean | undefined>(undefined);

  const { data: election } = useQuery(['election', electionId], async () => {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();

    if (error) throw error;
    return data as Election;
  });

  useEffect(() => {
    setIsPublished(election?.is_published);
  }, [election]);

  const { data: results, isLoading } = useQuery(['results', electionId], async () => {
    const { data: portfolios, error: portfoliosError } = await supabase
      .from('portfolios')
      .select(
        `
        *,
        candidates (*),
        votes (*)
      `
      )
      .eq('election_id', electionId);

    if (portfoliosError) throw portfoliosError;

    return portfolios.map((portfolio: any) => ({
      ...portfolio,
      results: portfolio.candidates.map((candidate: Candidate) => ({
        candidate,
        votes: portfolio.votes.filter(
          (vote: Vote) => vote.candidate_id === candidate.id
        ).length,
      })),
    }));
  });

  // Only allow access if user is admin or results are published
  if (!isLoading && (!election?.is_published && election?.created_by !== user?.id)) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Election Results</h2>
        {user?.id === election?.created_by && (
          <button
            onClick={async () => {
              const { data, error } = await supabase
                .from('elections')
                .update({ is_published: !isPublished })
                .eq('id', election?.id);

              if (!error) {
                setIsPublished(!isPublished); // Update local state
              }
            }}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!isPublished?"bg-primary hover:bg-primary/90":"bg-red-600 hover:bg-red-600/90" }`}
          >
            {isPublished ? 'Unpublish Results' : 'Publish Results'}
          </button>
        )}
      </div>

      <div className="space-y-8">
        {results?.map((portfolio: any) => (
          <div key={portfolio.id} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">{portfolio.title}</h3>
            <ResultsChart data={portfolio.results} />
          </div>
        ))}
      </div>
    </div>
  );
};