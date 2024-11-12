import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarIcon, UserGroupIcon, ShareIcon } from '@heroicons/react/24/outline';
import type { Election } from '../types';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
interface ElectionCardProps {
  election: Election;
  totalVotes:Promise<number>;
}

export const ElectionCard: React.FC<ElectionCardProps> = ({ election, totalVotes }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.id === election.created_by;
  const [votes, setVotes] = useState<number | null>(null);

  const votingStarted = new Date(election.start_time) <= new Date();

  const handleShare = async () => {
    try {
      const voteLink = `${window.location.origin}/vote/${election.id}/auth`;
      
      // Example API call to send links (replace with your actual API endpoint)
      await fetch('https://api.example.com/send-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          electionId: election.id,
          voteLink
        })
      });
      
      toast.success('Voting links sent successfully!');
    } catch (error) {
      toast.error('Failed to send voting links');
    }
  };

  const handleCopyLink = () => {
    const voteLink = `${window.location.origin}/vote/${election.id}/auth`;
    navigator.clipboard.writeText(voteLink);
    toast.success('Voting link copied to clipboard!');
  };

  useEffect(() => {
    totalVotes.then(setVotes).catch(() => setVotes(0));
  }, [totalVotes]);


  return (
    <div 
     onClick={() => isAdmin && navigate(`/election/${election.id}`)}
      className={`bg-white rounded-lg shadow-sm p-6 ${isAdmin ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <h3 className="text-lg font-semibold mb-2">{election.name}</h3>
      <p className="text-gray-600 text-sm mb-4">{election.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <CalendarIcon className="h-5 w-5 mr-2" />
          <span>
            {new Date(election.start_time).toLocaleDateString()} -{' '}
            {new Date(election.end_time).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <UserGroupIcon className="h-5 w-5 mr-2" />
          <span>{votes !== null ? votes : 'Loading...'} votes cast</span>
        </div>
      </div>

      <div className="flex space-x-2">
        {/* <Link
          to={`/vote/${election.id}/auth`}
          className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 text-center"
        >
          Vote
        </Link> */}
        {(isAdmin || election.is_published) && (
          <Link
            to={`/results/${election.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 text-center"
          >
            Results
          </Link>
        )}
        {isAdmin && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLink();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Copy Link
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const ElectionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
  <div className="space-y-2 mb-4">
    <div className="flex items-center h-4 bg-gray-200 rounded mb-1"></div>
    <div className="flex items-center h-4 bg-gray-200 rounded"></div>
  </div>
  <div className="flex space-x-2">
    <div className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-200 text-center h-10"></div>
    <div className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700  hover:bg-gray-50 text-center h-10 bg-gray-200"></div>
  </div>
</div>
  );
};


