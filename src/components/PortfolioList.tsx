import React, { useState } from 'react';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Portfolio, Candidate } from '../types';

interface PortfolioListProps {
  portfolios: (Portfolio & { candidates: Candidate[] })[];
  electionId: string;
  votingStarted: boolean;
}

export const PortfolioList: React.FC<PortfolioListProps> = ({
  portfolios,
  electionId,
  votingStarted,
}) => {
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);
  const { register, handleSubmit, reset } = useForm();

  const handleAddCandidate = async (data: any, portfolioId: string) => {
    try {
      const { error } = await supabase.from('candidates').insert({
        portfolio_id: portfolioId,
        name: data.candidateName,
        image_url: data.imageUrl || null,
      });

      if (error) throw error;
      toast.success('Candidate added successfully');
      reset();
      setEditingPortfolio(null);
    } catch (error) {
      toast.error('Failed to add candidate');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-bold mb-4">Portfolios & Candidates</h3>
      
      <div className="space-y-6">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-medium">{portfolio.title}</h4>
              {!votingStarted && (
                <button
                  onClick={() => setEditingPortfolio(portfolio.id)}
                  className="text-primary hover:text-primary/90"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className="p-4 border rounded-lg flex items-center space-x-4"
                >
                  {candidate.image_url && (
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <span>{candidate.name}</span>
                </div>
              ))}
            </div>

            {editingPortfolio === portfolio.id && !votingStarted && (
              <form
                onSubmit={handleSubmit((data) => handleAddCandidate(data, portfolio.id))}
                className="mt-4 space-y-4"
              >
                <input
                  {...register('candidateName')}
                  placeholder="Candidate Name"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <input
                  {...register('imageUrl')}
                  placeholder="Image URL (optional)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                />
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    Add Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPortfolio(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};