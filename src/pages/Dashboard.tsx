import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabase";
import { ElectionCard, ElectionCardSkeleton } from "../components/ElectionCard";
import { useAuth } from "../hooks/useAuth";
import type { Election } from "../types";

const fetchTotalVotes = async (electionId: string) => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("election_id", electionId);

  console.log(data?.length);
  if (error) throw error;
  return data.length || 0; // Return the total votes or 0 if none
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data: elections,
    isLoading,
    refetch,
  } = useQuery<Election[]>(
    ["elections"],
    async () => {
      const { data, error } = await supabase
        .from("elections")
        .select("*")
        .eq("created_by", user?.id)
        .eq("soft_delete", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    {
      enabled: !!user,
    }
  );

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((element) => (
          <ElectionCardSkeleton key={element} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Elections</h1>
        <Link
          to="/election/setup"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Election
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {elections?.map((election) => {
          const totalVotes = fetchTotalVotes(election.id); // Fetch total votes for each election
          return (
            <ElectionCard
              key={election.id}
              election={election}
              totalVotes={totalVotes}
            />
          );
        })}
      </div>
    </div>
  );
};
