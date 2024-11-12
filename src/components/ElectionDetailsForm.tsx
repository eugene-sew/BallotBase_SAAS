import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const electionDetailsSchema = z.object({
  name: z.string().min(1, 'Election name is required'),
  description: z.string().min(1, 'Description is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type ElectionDetailsFormData = z.infer<typeof electionDetailsSchema>;

interface ElectionDetailsFormProps {
  onNext: (data: ElectionDetailsFormData) => void;
  initialData?: Partial<ElectionDetailsFormData>;
}

export const ElectionDetailsForm: React.FC<ElectionDetailsFormProps> = ({
  onNext,
  initialData = {},
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ElectionDetailsFormData>({
    defaultValues: initialData,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Election Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="e.g., Student Council Elections 2024"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          placeholder="Provide details about the election..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            id="startTime"
            {...register('startTime')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.startTime && (
            <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            id="endTime"
            {...register('endTime')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
          {errors.endTime && (
            <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Next Step
        </button>
      </div>
    </form>
  );
};