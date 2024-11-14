import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { Voter } from '../types';

interface VoterListProps {
  voters: Voter[];
  electionId: string;
  onUploadSuccess: ()=>void;
}

export const VoterList: React.FC<VoterListProps> = ({ voters, electionId,onUploadSuccess }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [newlyAddedIndexes, setNewlyAddedIndexes] = useState<string[]>([]);
  const { register, handleSubmit } = useForm();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const newVoters = results.data.map((row: any) => ({
            election_id: electionId,
            index: row.index || '',
            name: row.name || '',
            phone: row.phone || '',
            program: row.program || '',
            year: row.year || '',
          }));

          const { data: existingVoters, error: fetchError } = await supabase
            .from('voters')
            .select('index')
            .eq('election_id', electionId);

          if (fetchError) throw fetchError;

          const existingIndexes = existingVoters.map((v) => v.index);
          const freshVoters = newVoters.filter((voter) => !existingIndexes.includes(voter.index));

          if (freshVoters.length > 0) {
            const { error: insertError } = await supabase.from('voters').insert(freshVoters);
            if (insertError) throw insertError;

            toast.success('Voters updated successfully');
            setNewlyAddedIndexes(freshVoters.map((voter) => voter.index));
          } else {
            toast.custom('No new voters to add');
          }
          onUploadSuccess()
          setShowUpload(false);
        } catch (error) {
          toast.error('Failed to update voters');
        }
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Voter Register</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
        >
          Update Voters
        </button>
      </div>

      {showUpload && (
        <div className="mb-6 p-4 border rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Upload New Voter List</h4>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
          />
          <p className="mt-2 text-sm text-gray-500">
            CSV should contain columns: index, name, phone, program, year
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Index
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Program
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {voters.map((voter) => (
              <tr
                key={voter.id}
                className={
                  newlyAddedIndexes.includes(voter.index)
                    ? 'bg-yellow-100' // Highlight for new entries
                    : ''
                }
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm">{voter.index}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{voter.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{voter.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{voter.program}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {voter.has_voted ? (
                    <span className="text-green-600">Voted</span>
                  ) : (
                    <span className="text-gray-500">Not voted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
