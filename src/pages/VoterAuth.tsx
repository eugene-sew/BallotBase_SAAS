import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";

interface IndexForm {
  index: string;
}

interface OtpForm {
  otp: string;
}

interface Voter {
  id: string;
  index: string;
  phone: string;
  has_voted: boolean;
}

export const VoterAuth: React.FC = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [voterData, setVoterData] = useState<Voter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isElectionStarted, setIsElectionStarted] = useState(false);
  const [isElectionOver, setIsElectionOver] = useState(false);
  const [timeLeftToStart, setTimeLeftToStart] = useState<number>(0);

  const indexForm = useForm<IndexForm>();
  const otpForm = useForm<OtpForm>();

  // Timer for countdown
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

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPhoneNumber = (phone: string) =>
    `${phone.slice(0, 3)}****${phone.slice(-4)}`;

  // Check election start and end times
  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const { data: election, error } = await supabase
          .from("elections")
          .select("start_time, end_time")
          .eq("id", electionId)
          .single();

        if (error || !election) {
          toast.error("Failed to load election data");
          return;
        }

        const now = new Date();
        const startTime = new Date(election.start_time);
        const endTime = new Date(election.end_time);

        if (now < startTime) {
          setTimeLeftToStart(
            Math.floor((startTime.getTime() - now.getTime()) / 1000)
          );
        } else if (now > endTime) {
          setIsElectionOver(true);
        } else {
          setIsElectionStarted(true);
        }
      } catch {
        toast.error("Error fetching election data");
      }
    };

    fetchElectionData();
  }, [electionId]);

  useEffect(() => {
    if (timeLeftToStart > 0) {
      const timer = setInterval(() => {
        setTimeLeftToStart((prev) => {
          const newTimeLeft = prev - 1;
          if (newTimeLeft <= 0) {
            setIsElectionStarted(true);
            clearInterval(timer);
          }
          return newTimeLeft;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeftToStart]);

  // Handle index submission and send OTP
  const handleIndexSubmit = async (data: IndexForm) => {
    if (!isElectionStarted) {
      toast.error("Election has not started yet.");
      return;
    }
    setIsLoading(true);

    try {
      const normalizedIndex = data.index.replace(/^0+/, "");
      const { data: voter, error: voterError } = await supabase
        .from("voters")
        .select("*")
        .eq("election_id", electionId)
        .eq("index", normalizedIndex)
        .single();

      if (voterError || !voter) {
        toast.error("Invalid index number");
        return;
      }

      if (voter.has_voted) {
        toast.error("You have already voted in this election");
        return;
      }

      setStep(2);
      setVoterData(voter);

      const response = await fetch(import.meta.env.VITE_SEND_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indexNumber: normalizedIndex,
          electionId: electionId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData) {
        toast.error("Failed to send OTP");
        return;
      }

      toast.success(`OTP sent to ${formatPhoneNumber(voter.phone)}`);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (data: OtpForm) => {
    if (!voterData) {
      toast.error("Voter data not found");
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_VERIFY_OTP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indexNumber: voterData.index,
          code: data.otp,
          uid: voterData.id,
          electionId: electionId,
        }),
      });

      const verifyResponse = await response.json();

      if (verifyResponse.code !== "1100") {
        toast.error("Invalid OTP code");
        return;
      }

      sessionStorage.setItem("voter_id", voterData.id);
      navigate(`/vote/${electionId}`);
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {isElectionOver ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Election Over</h2>
            <p className="text-gray-600">This election has ended.</p>
          </div>
        ) : !isElectionStarted ? (
          <div>
            <h2 className="text-xl font-bold text-center mb-6">
              Election Countdown
            </h2>
            <p className="text-center text-lg">
              Election starts in{" "}
              <span className="text-primary font-semibold text-3xl">
                {formatTime(timeLeftToStart)}
              </span>
            </p>
          </div>
        ) : step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Voter Authentication
            </h2>
            <form
              onSubmit={indexForm.handleSubmit(handleIndexSubmit)}
              className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Index Number
                </label>
                <input
                  type="text"
                  {...indexForm.register("index")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="0320000000"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Voter Authentication
            </h2>
            <form
              onSubmit={otpForm.handleSubmit(handleOtpSubmit)}
              className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                {voterData && (
                  <p>
                    Enter the OTP sent to {formatPhoneNumber(voterData.phone)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  {...otpForm.register("otp")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  maxLength={6}
                  placeholder="******"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}>
                {isLoading ? "Processing..." : "Continue"}
              </button>
            </form>
            <div className="text-sm text-center mt-4">
              <p className="text-gray-600">
                Resend OTP in:{" "}
                <span
                  className={`font-semibold ${
                    canResend ? "text-primary" : "text-gray-500"
                  }`}>
                  {formatTime(countdown)}
                </span>
              </p>
              {canResend && (
                <button
                  className="text-primary font-medium mt-2"
                  onClick={() => {
                    setCountdown(300);
                    setCanResend(false);
                  }}>
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <div className="mt-6 text-center text-gray-600">
        <p>
          Back to{" "}
          <Link
            to="/"
            className="text-primary font-medium">
            Home
          </Link>
        </p>
      </div>
    </div>
  );
};
