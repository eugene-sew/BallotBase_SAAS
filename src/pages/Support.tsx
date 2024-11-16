import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import axios from "axios";

const ARKESEL_API_BASE_URL = import.meta.env.VITE_ARKESEL_API_URL;
const ARKESEL_API_KEY = import.meta.env.VITE_ARKESEL_API_KEY;

export const Support: React.FC = () => {
  const { electionId } = useParams();
  const [indexNumber, setIndexNumber] = useState("");
  const [problem, setProblem] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Save the support request in Supabase
      const { data, error } = await supabase.from("support").insert([
        {
          election: electionId,
          index_number: indexNumber,
          problem,
        },
      ]);

      if (error) throw error;

      // Fetch election and creator details
      const { data: election, error: fetchElectionError } = await supabase
        .from("elections")
        .select("name, created_by")
        .eq("id", electionId)
        .single();

      if (fetchElectionError || !election) {
        toast.error("Failed to fetch election details");
        return;
      }

      const { data: creator, error: fetchCreatorError } = await supabase
        .from("users") // Assuming you have a 'users' table
        .select("phone")
        .eq("id", election.created_by)
        .single();

      if (fetchCreatorError || !creator) {
        toast.error("Failed to fetch election creator's phone number");
        return;
      }

      // Prepare the SMS message and recipients
      const message = `Hello Admin, My Index Number is: ${indexNumber}, I am facing problems in the ${election.name} election: \n ${problem}`;
      const recipients = ["233537211043", creator.phone];

      // Send the SMS using Arkesel API
      const response = await axios.post(
        ARKESEL_API_BASE_URL,
        {
          sender: "BallotBase",
          message,
          recipients,
        },
        {
          headers: {
            "api-key": ARKESEL_API_KEY,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Support request sent successfully!");
      } else {
        toast.error("Failed to send support request");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 h-fit">
        <h2 className="text-2xl font-bold text-gray-700 text-center mb-4">
          Need Support?
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your index number and describe your issue. We'll get back to you
          soon.
        </p>
        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div>
            <label
              htmlFor="indexNumber"
              className="block text-sm font-medium text-gray-700">
              Index Number
            </label>
            <input
              type="text"
              id="indexNumber"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={indexNumber}
              onChange={(e) => setIndexNumber(e.target.value)}
              placeholder="e.g., 12345678"
            />
          </div>
          <div>
            <label
              htmlFor="problem"
              className="block text-sm font-medium text-gray-700">
              Describe Your Issue
            </label>
            <textarea
              id="problem"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Describe your problem here..."
              rows={4}></textarea>
          </div>
          <button
            type="submit"
            className={`w-full px-4 py-2 text-white font-medium rounded-lg shadow-sm text-sm ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary/90"
            }`}
            disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
};
