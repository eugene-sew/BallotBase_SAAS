import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { PortfolioList } from "../components/PortfolioList";
import { VoterList } from "../components/VoterList";
import { useAuth } from "../hooks/useAuth";
import { ShareIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { Election, Portfolio, Candidate, Voter } from "../types";

export const ElectionDetails: React.FC = () => {
  const { electionId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const SHARE_URL = import.meta.env.VITE_SHARE_URL;
  const [votedCount, setVotedCount] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPub, setIsPub] = useState(false);

  const { data: election } = useQuery(["election", electionId], async () => {
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .eq("id", electionId)
      .single();

    if (error) throw error;
    return data as Election;
  });

  const { data: portfolios } = useQuery(
    ["portfolios", electionId],
    async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select(`*, candidates (*)`)
        .eq("election_id", electionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as (Portfolio & { candidates: Candidate[] })[];
    }
  );

  const { data: voters } = useQuery(["voters", electionId], async () => {
    const { data, error } = await supabase
      .from("voters")
      .select("*")
      .eq("election_id", electionId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Voter[];
  });

  const votingStarted = election && new Date(election.start_time) <= new Date();
  const isAdmin = user?.id === election?.created_by;

  const handleCopyLink = () => {
    const voteLink = `${window.location.origin}/vote/${electionId}/auth`;
    navigator.clipboard.writeText(voteLink);
    toast.success("Voting link copied to clipboard!");
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const voteLink = `${window.location.origin}/vote/${electionId}/auth`;
      await fetch(SHARE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electionId: electionId,
          voteLink,
        }),
      });

      toast.success("Voting links sent successfully!");
    } catch (error) {
      toast.error("Failed to send voting links");
    }
    setIsSharing(false);
  };

  const refetchVoters = () => {
    queryClient.invalidateQueries(["voters", electionId]);
  };

  useEffect(() => {
    const fetchInitialVotedCount = async () => {
      const { count } = await supabase
        .from("voters")
        .select("id", { count: "exact" })
        .eq("election_id", electionId)
        .eq("has_voted", true);

      setVotedCount(count || 0);
    };

    fetchInitialVotedCount();

    const channel: RealtimeChannel = supabase
      .channel(`voters:election_id=eq.${electionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "voters",
          filter: `election_id=eq.${electionId}`,
        },
        (payload) => {
          if (payload.new.has_voted && !payload.old.has_voted) {
            setVotedCount((prevCount) => prevCount + 1);
          }
          if (!payload.new.has_voted && payload.old.has_voted) {
            setVotedCount((prevCount) => prevCount - 1);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [electionId]);

  const handleDeleteElection = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("elections")
        .update({ soft_delete: true }) // Set soft_delete to true
        .eq("id", electionId);

      if (error) throw error;

      toast.success("Election deleted successfully!");
      navigate("/dashboard"); // Redirect to dashboard after deletion
    } catch (error) {
      toast.error(`Failed to delete election: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!election || !isAdmin) {
    return <div>Not authorized</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-4">{election.name}</h2>
        <p className="text-gray-600 mb-4">{election.description}</p>

        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Start: {new Date(election.start_time).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            End: {new Date(election.end_time).toLocaleString()}
          </p>
        </div>

        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Copy Link
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            {!isSharing ? (
              <ShareIcon className="h-5 w-5 mr-2" />
            ) : (
              <span className="ml-2 animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-r-white"></span>
            )}
          </button>
          {(isAdmin || election.is_published) && (
            <Link
              to={`/results/${electionId}`}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 text-center">
              Results
            </Link>
          )}
          {/* Delete Election Button */}
          <button
            onClick={handleDeleteElection}
            className="px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 text-center"
            disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Election"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mt-4">
        <h3 className="text-lg font-bold mb-2">Voters</h3>
        <p className="text-sm text-gray-600">
          <strong>{votedCount}</strong> of{" "}
          <strong>{voters?.length || 0}</strong> voters have voted
        </p>
      </div>

      {portfolios && (
        <PortfolioList
          portfolios={portfolios}
          electionId={electionId!}
          votingStarted={votingStarted || false}
        />
      )}

      {voters && (
        <VoterList
          voters={voters}
          electionId={electionId!}
          onUploadSuccess={refetchVoters}
        />
      )}
    </div>
  );
};
