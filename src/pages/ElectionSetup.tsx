import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { ElectionDetailsForm } from '../components/ElectionDetailsForm';
import { PortfoliosForm } from '../components/PortfoliosForm';
import { VoterUploadForm } from '../components/VoterUploadForm';
import { ReviewForm } from '../components/ReviewForm';

const STEPS = ['Details', 'Portfolios', 'Voters', 'Review'];

export const ElectionSetup: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [electionData, setElectionData] = useState<any>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNext = (data: any) => {
    setElectionData((prev: any) => ({ ...prev, ...data }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const { data: election, error: electionError } = await supabase
        .from('elections')
        .insert([
          {
            name: electionData.name,
            description: electionData.description,
            start_time: electionData.startTime,
            end_time: electionData.endTime,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (electionError) throw electionError;

      // Insert portfolios and candidates
      for (const portfolio of electionData.portfolios) {
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolios')
          .insert([
            {
              election_id: election.id,
              title: portfolio.title,
              is_yes_no: portfolio.candidates.length === 1,
            },
          ])
          .select()
          .single();

        if (portfolioError) throw portfolioError;

        // Insert candidates
        const candidatesData = portfolio.candidates.map((candidate: any) => ({
          portfolio_id: portfolioData.id,
          name: candidate.name,
          image_url: candidate.imageUrl,
        }));

        const { error: candidatesError } = await supabase
          .from('candidates')
          .insert(candidatesData);

        if (candidatesError) throw candidatesError;
      }

      // Insert voters with election_id, otp, and verified fields
      const votersData = electionData.voters.map((voter: any) => ({
        ...voter,
        election_id: election.id,
        
      }));

      const { error: votersError } = await supabase
        .from('voters')
        .insert(votersData);

      if (votersError) throw votersError;

      toast.success('Election created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(`Failed to create election, ${error}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`flex items-center ${
                index <= currentStep ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-primary text-white' : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </div>
              <span className="ml-2">{step}</span>
              {index < STEPS.length - 1 && (
                <div className="w-full h-0.5 mx-4 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 0 && (
          <ElectionDetailsForm onNext={handleNext} initialData={electionData} />
        )}
        {currentStep === 1 && (
          <PortfoliosForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={electionData}
          />
        )}
        {currentStep === 2 && (
          <VoterUploadForm
            onNext={handleNext}
            onBack={handleBack}
            initialData={electionData}
          />
        )}
        {currentStep === 3 && (
          <ReviewForm
            data={electionData}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};