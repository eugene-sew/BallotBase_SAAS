import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface IndexForm {
  index: string;
}

interface OtpForm {
  otp: string;
}

interface Voter {
  id: string;
  index:string;
  phone: string;
  has_voted: boolean;
}

interface OtpResponse {
  message: string;
  code: string;
  data: {
    requestId: string;
    prefix: string;
  };
}

export const VoterAuth: React.FC = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [requestId, setRequestId] = useState<string>('');
  const [prefix, setPrefix] = useState<string>('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [voterData, setVoterData] = useState<Voter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const indexForm = useForm<IndexForm>();
  const otpForm = useForm<OtpForm>();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPhoneNumber = (phone: string) => {
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  };

  const handleIndexSubmit = async (data: IndexForm) => {

    setIsLoading(true);
    const indexNumber = data.index.slice(1);
    console.log(indexNumber)
    try {
      // First find voter record
      const { data: voter, error: voterError } = await supabase
        .from('voters')
        .select('*')
        .eq('election_id', electionId)
        .eq('index', indexNumber)
        .single();

      if (voterError || !voter) {
        toast.error('Invalid index number');
        return;
      }

      if (voter.has_voted) {
        toast.error('You have already voted in this election');
        return;
      }

      if (!voter.phone) {
        toast.error('No phone number found for this voter');
        return;
      }

      // Send OTP to the phone number using the new endpoint
      const response = await fetch(import.meta.env.VITE_SEND_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          indexNumber: indexNumber, 
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData) {
        toast.error('Failed to send OTP');
        return;
      }

      setRequestId(responseData.requestId); // Assuming response contains requestId
      setPrefix(responseData.prefix); // Assuming response contains prefix
      setVoterData(voter);
      setStep(2);
      
      if (responseData.message) {
        toast.success(responseData.message);
      } else {
        toast.success(`OTP sent to ${formatPhoneNumber(voter.phone)}`);
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (data: OtpForm) => {
    if (!voterData) {
        toast.error('Voter data not found');
        return;
    }

    setIsLoading(true);
    try {
        // Verify OTP with the new endpoint
        const response = await fetch(import.meta.env.VITE_VERIFY_OTP, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                indexNumber: voterData.index, 
                code: data.otp,
                uid: voterData.id 
            }),
        });

        const verifyResponse = await response.json();

        if (!response.ok) {
            toast.error('Invalid OTP code');
            return;
        }

        sessionStorage.setItem('voter_id', voterData.id);
        navigate(`/vote/${electionId}`);
    } catch (error) {
        toast.error('Verification failed');
    } finally {
        setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!voterData) {
      toast.error('Voter data not found');
      return;
    }

    setIsLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke<OtpResponse>('resend-otp', {
        body: { requestId }
      });

      if (error || !response) {
        toast.error('Failed to resend OTP');
        return;
      }

      // Update requestId and prefix from resend response
      setRequestId(response.data.requestId);
      setPrefix(response.data.prefix);
      setCanResend(false);
      setCountdown(300);

      if (response.message) {
        toast.success(response.message);
      } else {
        toast.success(`OTP resent to ${formatPhoneNumber(voterData.phone)}`);
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Voter Authentication</h2>
        
        {step === 1 ? (
          <form onSubmit={indexForm.handleSubmit(handleIndexSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Index Number
              </label>
              <input
                type="text"
                {...indexForm.register('index')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Enter your index number"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
            <div className="text-center text-sm text-gray-600 mb-4">
              {voterData && (
                <p>Enter the OTP sent to {formatPhoneNumber(voterData.phone)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter OTP Code
              </label>
              <input
                type="text"
                {...otpForm.register('otp')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                disabled={isLoading}
              />
            </div>
            <div className="text-sm text-center text-gray-600">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary hover:text-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              ) : (
                <span>Resend OTP in {formatTime(countdown)}</span>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};