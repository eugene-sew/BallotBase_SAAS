import React, { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { ResultsChart } from "../components/ResultsChart";
import { useAuth } from "../hooks/useAuth";
import type { Portfolio, Candidate, Vote, Election } from "../types";
import toast from "react-hot-toast";
import { ShareIcon } from "lucide-react";

export const Results: React.FC = () => {
  const { electionId } = useParams();
  const { user } = useAuth();
  const [isPublished, setIsPublished] = useState<boolean | undefined>(
    undefined
  );
  const [isPub, setIsPub] = useState(false);
  const PUB_URL = import.meta.env.VITE_PUBLISH_URL;

  const { data: election } = useQuery(["election", electionId], async () => {
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .eq("id", electionId)
      .single();

    if (error) throw error;
    return data as Election;
  });

  useEffect(() => {
    setIsPublished(election?.is_published);
  }, [election]);

  const { data: results, isLoading } = useQuery(
    ["results", electionId],
    async () => {
      const { data: portfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select(
          `
        *,
        candidates (*),
        votes (*)
      `
        )
        .eq("election_id", electionId);

      if (portfoliosError) throw portfoliosError;

      return portfolios.map((portfolio: any) => ({
        ...portfolio,
        results: portfolio.candidates.map((candidate: Candidate) => ({
          candidate,
          votes: portfolio.votes.filter(
            (vote: Vote) => vote.candidate_id === candidate.id
          ).length,
        })),
      }));
    }
  );

  const handlePublish = async () => {
    setIsPub(true);

    try {
      const { data, error } = await supabase
        .from("elections")
        .update({ is_published: !isPublished })
        .eq("id", election?.id);

      if (error) throw error;
      setIsPublished(!isPublished);

      if (!isPublished) {
        const pubLink = `${window.location.origin}/results/${electionId}/`;
        await fetch(PUB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            electionId: electionId,
            pubLink: pubLink,
          }),
        });

        toast.success("Results shared successfully!");
      } else {
        toast.success("Results unpublished successfully!");
      }
    } catch (error) {
      toast.error("Failed to update results visibility");
    }

    setIsPub(false);
  };

  if (
    !isLoading &&
    election &&
    user?.id &&
    !election.is_published &&
    election.created_by !== user.id
  ) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-4xl mx-auto">
      {/* Main Results Section */}
      <div className="flex-1 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Election Results</h2>
          {user?.id === election?.created_by &&
            (isPub ? (
              <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
                <span className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-r-white"></span>
              </div>
            ) : (
              <button
                onClick={handlePublish}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !isPublished
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-red-600 hover:bg-red-600/90"
                }`}>
                {isPublished ? "Unpublish Results" : "Publish Results"}
              </button>
            ))}
        </div>

        {/* Display Results with Charts */}
        {results?.map((portfolio: any) => (
          <div
            key={portfolio.id}
            className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">{portfolio.title}</h3>
            <ResultsChart data={portfolio.results} />
          </div>
        ))}
      </div>

      {/* Sidebar Summary Section */}
      <aside className="lg:w-1/3 bg-gray-100 p-4 rounded-lg shadow-sm lg:ml-8 h-fit">
        <h3 className="text-lg font-semibold mb-4">Vote Summary</h3>
        {results?.map((portfolio: any) => (
          <div
            key={portfolio.id}
            className="mb-6">
            <h4 className="text-md font-semibold mb-2">{portfolio.title}</h4>
            {portfolio.results.map(({ candidate, votes }: any) => {
              const totalVotes = portfolio.votes.length;
              const votePercentage =
                totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
              return (
                <div
                  key={candidate.id}
                  className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span>{candidate.name}</span>
                    <span>
                      {votes} votes ({votePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${votePercentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </aside>
    </div>
  );
};
