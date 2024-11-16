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
  const [requestId, setRequestId] = useState<string>("");
  const [prefix, setPrefix] = useState<string>("");
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [voterData, setVoterData] = useState<Voter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isElectionStarted, setIsElectionStarted] = useState(false);

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatPhoneNumber = (phone: string) => {
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
  };

  const [isOTPSending, setIsOTPSending] = useState(false);

  // send otp
  const handleIndexSubmit = async (data: IndexForm) => {
    if (!isElectionStarted) {
      toast.error("Election has not started yet.");
      return;
    }
    setIsOTPSending(true);

    // const indexNumber = data.index.slice(1);
    const indexNumber = data.index.replace(/^0+/, "");
    console.log(indexNumber);

    console.log(indexNumber);

    try {
      const normalizedIndex = data.index.replace(/^0+/, "");

      const indexWithLeadingZero = `0${normalizedIndex}`;
      const { data: voter, error: voterError } = await supabase
        .from("voters")
        .select("*")
        .eq("election_id", electionId)
        .eq("index", normalizedIndex)
        .single();
      // .or(`index.eq.${normalizedIndex},index.eq.${indexWithLeadingZero}`);

      if (voterError || !voter) {
        toast.error("Invalid index number");
        return;
      }

      // const voter = voters[0];

      if (voter.has_voted) {
        toast.error("You have already voted in this election");
        return;
      }

      if (!voter.phone) {
        toast.error("No phone number found for this voter");
        return;
      }

      setStep(2);

      const response = await fetch(import.meta.env.VITE_SEND_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indexNumber: indexNumber,
          electionId: electionId,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData) {
        toast.error("Failed to send OTP");
        return;
      }

      setRequestId(responseData.requestId);
      setPrefix(responseData.prefix);
      setVoterData(voter);

      if (responseData.message) {
        toast.success(responseData.message);
      } else {
        toast.success(`OTP sent to ${formatPhoneNumber(voter.phone)}`);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setIsOTPSending(false);
    }
  };

  // verify otp
  const handleOtpSubmit = async (data: OtpForm) => {
    if (!voterData) {
      toast.error("Voter data not found");
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP with the new endpoint
      const response = await fetch(import.meta.env.VITE_VERIFY_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indexNumber: voterData.index,
          code: data.otp,
          uid: voterData.id,
          electionId: electionId,
        }),
      });

      const verifyResponse = await response.json();

      console.log(verifyResponse);

      if (verifyResponse.code !== "1100") {
        toast.error("Invalid OTP code");
        return;
      }

      sessionStorage.setItem("voter_id", voterData.id);
      navigate(`/vote/${electionId}`);
    } catch (error) {
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // resend otp
  const handleResendOtp = async () => {
    if (!voterData) {
      toast.error("Voter data not found");
      return;
    }

    setIsLoading(true);
    indexForm.handleSubmit(handleIndexSubmit);
  };

  // Fetch election start time
  useEffect(() => {
    const fetchElectionData = async () => {
      setIsLoadingDetails(true);
      try {
        const { data: election, error } = await supabase
          .from("elections")
          .select("start_time")
          .eq("id", electionId)
          .single();

        if (error || !election) {
          toast.error("Failed to load election data");
          return;
        }

        const electionStartTime = new Date(election.start_time);
        console.log(election.start_time);

        setStartTime(electionStartTime);

        const now = new Date();
        if (electionStartTime <= now) {
          setIsElectionStarted(true);
        } else {
          const secondsUntilStart = Math.floor(
            (electionStartTime.getTime() - now.getTime()) / 1000
          );
          setTimeLeft(secondsUntilStart);
        }
      } catch (err) {
        toast.error("An error occurred while fetching election details");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchElectionData();
  }, [electionId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
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
  }, [timeLeft]);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {isLoadingDetails ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-full h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="w-full h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ) : !isElectionStarted ? (
          <div>
            <h2 className="text-xl font-bold text-center mb-6">
              Election Countdown
            </h2>
            <p className="text-center text-lg">
              Election starts in <br />
              <span className="text-primary font-semibold text-3xl ">
                {" "}
                {formatTime(timeLeft)}{" "}
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
                {isOTPSending ? "Processing..." : "Continue"}
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
                    disabled={isLoading}>
                    Resend OTP
                  </button>
                ) : (
                  <span>Resend OTP in {formatTime(countdown)}</span>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Need support?{" "}
                  <Link
                    to={`/vote/${electionId}/support`}
                    className="text-primary hover:underline">
                    Contact Admin
                  </Link>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
