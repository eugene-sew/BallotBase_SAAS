import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-bold mb-6">
        <span className="text-primary">Ballot</span>Base
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl">
        Secure, transparent, and easy-to-use online voting platform for
        electoral bodies. Create and manage elections with real-time results.
      </p>

      <div className="space-y-4 magicpattern">
        {user ? (
          <Link
            to="/dashboard"
            className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
            Go to Dashboard
          </Link>
        ) : (
          <div className="space-x-4">
            <Link
              to="/register"
              className="inline-block px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block px-8 py-3 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors">
              Sign In
            </Link>
          </div>
        )}
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Secure Voting</h3>
          <p className="text-gray-600">
            OTP-based authentication and real-time monitoring ensure secure and
            transparent elections.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Real-time Results</h3>
          <p className="text-gray-600">
            Monitor election progress and results in real-time with interactive
            charts.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Easy Setup</h3>
          <p className="text-gray-600">
            Create elections, upload voter registers, and manage portfolios with
            ease.
          </p>
        </div>
      </div>
    </div>
  );
};
