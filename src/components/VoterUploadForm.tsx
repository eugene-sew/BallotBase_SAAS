import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Papa from 'papaparse';

const voterUploadSchema = z.object({
  voters: z.array(z.object({
    index: z.string().min(1, 'Index is required'),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().min(1, 'Phone is required'),
    program: z.string().min(1, 'Program is required'),
    year: z.string().min(1, 'Year is required'),
  })).min(1, 'At least one voter is required'),
});

type VoterUploadFormData = z.infer<typeof voterUploadSchema>;

interface VoterUploadFormProps {
  onNext: (data: VoterUploadFormData) => void;
  onBack: () => void;
  initialData?: Partial<VoterUploadFormData>;
}

export const VoterUploadForm: React.FC<VoterUploadFormProps> = ({
  onNext,
  onBack,
  initialData = { voters: [] },
}) => {
  const { handleSubmit, setValue, watch } = useForm<VoterUploadFormData>({
    defaultValues: initialData,
  });

  const voters = watch('voters');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const parsedVoters = results.data.map((row: any) => ({
          index: row.index || '',
          name: row.name || '',
          phone: row.phone || '',
          program: row.program || '',
          year: row.year || '',
        }));
        setValue('voters', parsedVoters);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Voter Register (CSV)
        </label>
        <div className="mt-1">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          CSV should contain columns: index, name, phone, program, year
        </p>
      </div>

      {voters && voters.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Preview ({voters.length} voters)
          </h3>
          <div className="border rounded-lg overflow-hidden">
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
                    Year
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {voters.slice(0, 5).map((voter, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {voter.year}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {voters.length > 5 && (
              <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500">
                And {voters.length - 5} more voters...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
          disabled={!voters || voters.length === 0}
        >
          Next Step
        </button>
      </div>
    </form>
  );
};