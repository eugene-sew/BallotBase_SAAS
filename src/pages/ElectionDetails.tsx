import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { PortfolioList } from '../components/PortfolioList';
import { VoterList } from '../components/VoterList';
import { useAuth } from '../hooks/useAuth';
import type { Election, Portfolio, Candidate, Voter } from '../types';

export const ElectionDetails: React.FC = () => {
  const { electionId } = useParams();
  const { user } = useAuth();

  const { data: election } = useQuery(['election', electionId], async () => {
    const { data, error } = await supabase
      .from('elections')
      .select('*')
      .eq('id', electionId)
      .single();

    if (error) throw error;
    return data as Election;
  });

  const { data: portfolios } = useQuery(['portfolios', electionId], async () => {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        candidates (*)
      `)
      .eq('election_id', electionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as (Portfolio & { candidates: Candidate[] })[];
  });

  const { data: voters } = useQuery(['voters', electionId], async () => {
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('election_id', electionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as Voter[];
  });

  const votingStarted = election && new Date(election.start_time) <= new Date();

  if (!election || user?.id !== election.created_by) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">{election.name}</h2>
        <p className="text-gray-600 mb-4">{election.description}</p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Start: {new Date(election.start_time).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            End: {new Date(election.end_time).toLocaleString()}
          </p>
        </div>
      </div>

      {portfolios && (
        <PortfolioList
          portfolios={portfolios}
          electionId={electionId!}
          votingStarted={votingStarted || false}
        />
      )}

      {voters && (
        <VoterList
          voters={voters}
          electionId={electionId!}
        />
      )}
    </div>
  );
};