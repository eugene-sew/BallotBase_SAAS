import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { z } from 'zod';
import { useEffect } from 'react';

const portfolioSchema = z.object({
  portfolios: z.array(z.object({
    title: z.string().min(1, 'Portfolio title is required'),
    candidates: z.array(z.object({
      name: z.string().min(1, 'Candidate name is required'),
      imageUrl: z.string().optional(),
    })).min(1, 'At least one candidate is required'),
  })).min(1, 'At least one portfolio is required'),
});

type PortfoliosFormData = z.infer<typeof portfolioSchema>;

interface PortfoliosFormProps {
  onNext: (data: PortfoliosFormData) => void;
  onBack: () => void;
  initialData?: Partial<PortfoliosFormData>;
}

export const PortfoliosForm: React.FC<PortfoliosFormProps> = ({
  onNext,
  onBack,
  initialData = { portfolios: [{ title: '', candidates: [{ name: '', imageUrl: '' }] }] },
}) => {
  const { register, control, handleSubmit, formState: { errors } } = useForm<PortfoliosFormData>({
    defaultValues: initialData,
    mode: 'onBlur',
  });

  const { fields: portfolios, append: appendPortfolio, remove: removePortfolio } = 
    useFieldArray({ control, name: 'portfolios' });

  // Create a component for the nested candidates field array
  const PortfolioCandidates = ({ portfolioIndex }: { portfolioIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control,
      name: `portfolios.${portfolioIndex}.candidates`,
    });

    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Candidates</h4>
        {fields.map((candidate, candidateIndex) => (
          <div key={candidate.id} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                {...register(`portfolios.${portfolioIndex}.candidates.${candidateIndex}.name`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Candidate Name"
              />
              {errors.portfolios?.[portfolioIndex]?.candidates?.[candidateIndex]?.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.portfolios?.[portfolioIndex]?.candidates?.[candidateIndex]?.name?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                type="text"
                {...register(`portfolios.${portfolioIndex}.candidates.${candidateIndex}.imageUrl`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Image URL (optional)"
              />
            </div>
            {candidateIndex > 0 && (
              <button
                type="button"
                onClick={() => remove(candidateIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: '', imageUrl: '' })}
          className="inline-flex items-center text-sm text-primary hover:text-primary/90"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Candidate
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8">
      <div className="space-y-6">
        {portfolios.map((portfolio, portfolioIndex) => (
          <div key={portfolio.id} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Portfolio {portfolioIndex + 1}</h3>
              {portfolioIndex > 0 && (
                <button
                  type="button"
                  onClick={() => removePortfolio(portfolioIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Portfolio Title
              </label>
              <input
                type="text"
                {...register(`portfolios.${portfolioIndex}.title`)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="e.g., President"
              />
              {errors.portfolios?.[portfolioIndex]?.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.portfolios[portfolioIndex]?.title?.message}
                </p>
              )}
            </div>

            <PortfolioCandidates portfolioIndex={portfolioIndex} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => appendPortfolio({ title: '', candidates: [{ name: '', imageUrl: '' }] })}
        className="inline-flex items-center text-sm text-primary hover:text-primary/90"
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Portfolio
      </button>

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
          disabled={Object.keys(errors).length > 0}
        >
          Next Step
        </button>
      </div>
    </form>
  );
};

export default PortfoliosForm;