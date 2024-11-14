import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Extract initials from email
  const getUserInitials = (email: string) => {
    const [firstPart, secondPart] = email.split("@");
    return firstPart && secondPart
      ? `${firstPart[0]}${secondPart[0]}`.toUpperCase()
      : "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex flex-col">
              <Link
                to="/"
                className="flex items-center">
                <span className="text-2xl font-bold text-[#2ba6ff]">
                  BallotBase
                </span>
              </Link>
              <span className="text-sm text-gray-500">
                Empowering Fair and Secure Elections
              </span>
            </div>
            <div className="flex items-center">
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`mx-4 ${
                      location.pathname === "/dashboard"
                        ? "text-[#2ba6ff]"
                        : "text-gray-500 hover:text-[#2ba6ff]"
                    }`}>
                    Dashboard
                  </Link>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 flex items-center justify-center bg-[#2ba6ff] text-white font-bold rounded-full">
                          {getUserInitials(user.email)}
                        </div>
                      )}
                      {/* <span className="text-gray-700 text-sm">{user.email}</span> */}
                    </div>

                    <button
                      onClick={signOut}
                      className="bg-red-500 hover:bg-red-600 transition-colors text-white font-medium rounded shadow p-2">
                      Sign Out
                    </button>
                  </div>
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
