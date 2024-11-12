import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-[#2ba6ff]">BallotBase</span>
              </Link>
            </div>
            <div className="flex items-center">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`mx-4 ${
                      location.pathname === '/dashboard'
                        ? 'text-[#2ba6ff]'
                        : 'text-gray-500 hover:text-[#2ba6ff]'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-gray-500 hover:text-[#2ba6ff]"
                  >
                    Sign Out
                  </button>
                </>
              )}
           
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};