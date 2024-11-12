import React from 'react';

interface ReviewFormProps {
  data: {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    portfolios: Array<{
      title: string;
      candidates: Array<{
        name: string;
        imageUrl?: string;
      }>;
    }>;
    voters: Array<{
      index: string;
      name: string;
      phone: string;
      program: string;
      year: string;
    }>;
  };
  onBack: () => void;
  onSubmit: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ data, onBack, onSubmit }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Election Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p><span className="font-medium">Name:</span> {data.name}</p>
          <p><span className="font-medium">Description:</span> {data.description}</p>
          <p>
            <span className="font-medium">Duration:</span>{' '}
            {new Date(data.startTime).toLocaleString()} to{' '}
            {new Date(data.endTime).toLocaleString()}
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Portfolios & Candidates</h3>
        <div className="space-y-4">
          {data.portfolios.map((portfolio, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">{portfolio.title}</h4>
              <ul className="list-disc list-inside space-y-1">
                {portfolio.candidates.map((candidate, candidateIndex) => (
                  <li key={candidateIndex}>
                    {candidate.name}
                    {candidate.imageUrl && ' (with image)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Voter Register</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-2">
            <span className="font-medium">Total Voters:</span> {data.voters.length}
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Index
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.voters.slice(0, 3).map((voter, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm">{voter.index}</td>
                    <td className="px-4 py-2 text-sm">{voter.name}</td>
                    <td className="px-4 py-2 text-sm">{voter.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.voters.length > 3 && (
              <p className="mt-2 text-sm text-gray-500">
                And {data.voters.length - 3} more voters...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          disabled={data.voters.length === 0}
        >
          Create Election
        </button>
      </div>
    </div>
  );
};