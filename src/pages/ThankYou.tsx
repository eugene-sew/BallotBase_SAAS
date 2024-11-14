import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const ThankYou: React.FC = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const voterId = sessionStorage.getItem('voter_id');
  const [phone, setPhone] = useState<string>('');

  useEffect(() => {
    if (!voterId) {
      navigate('/');
    }
  }, [voterId, navigate]);

  const { data: voter } = useQuery(['voter', voterId], async () => {
    if (!voterId) return null;
    const { data, error } = await supabase
      .from('voters')
      .select('*')
      .eq('id', voterId)
      .single();

    if (error) throw error;
    if (data) {
      // Format phone number to hide middle digits
      const formatted = data.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
      setPhone(formatted);
    }
    console.log(data)
    return data;
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Thank You for Voting! <br /> {voter?.name}
        </h2>
        
        <p className="text-gray-600 mb-6">
          Your vote has been recorded successfully. The results will be sent to your registered phone number ({phone}) once they are published.
        </p>

        <button
          onClick={() => {
            sessionStorage.removeItem('voter_id');
            navigate('/');
          }}
          className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};