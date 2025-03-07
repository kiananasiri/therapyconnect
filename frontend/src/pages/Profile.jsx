import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("info");

  // Sample user data (would come from an API in a real application)
  const userData = {
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    joinDate: "January 2023",
    upcomingSessions: 2,
    completedSessions: 14,
    therapist: "Dr. Michael Chen",
    progress: 75,
    notes: [
      { date: "June 15, 2023", content: "Great progress on anxiety management techniques." },
      { date: "May 28, 2023", content: "Discussed work-life balance strategies." },
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800 py-10 px-4 sm:px-6">
      {/* Back button */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link to="/" className="flex items-center text-pink-500 hover:text-pink-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Profile header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden mb-8"
      >
        <div className="bg-gradient-to-r from-pink-100 to-pink-200 h-48 flex items-end p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full relative -mb-16">
            <div className="h-32 w-32 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 border-4 border-white shadow-md flex items-center justify-center text-white text-4xl font-light">
              {userData.name.charAt(0)}
            </div>
            <div className="sm:mb-4 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{userData.name}</h1>
              <p className="text-gray-600">Member since {userData.joinDate}</p>
            </div>
          </div>
        </div>
        <div className="mt-16 px-6 pb-6"></div>
      </motion.div>

      {/* Tabs and content */}
      <div className="max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button 
            onClick={() => setActiveTab("info")}
            className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${
              activeTab === "info" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile Info
          </button>
          <button 
            onClick={() => setActiveTab("sessions")}
            className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${
              activeTab === "sessions" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Session History
          </button>
          <button 
            onClick={() => setActiveTab("notes")}
            className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${
              activeTab === "notes" 
                ? "text-pink-500 border-b-2 border-pink-500" 
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Therapy Notes
          </button>
        </div>

        {/* Tab content */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 mb-8"
        >
          {activeTab === "info" && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Personal Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="mt-1 text-gray-800">{userData.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                    <p className="mt-1 text-gray-800">{userData.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Therapist</label>
                    <p className="mt-1 text-gray-800">{userData.therapist}</p>
                  </div>
                </div>

                <button className="mt-6 px-4 py-2 bg-pink-100 text-pink-600 rounded-lg font-medium text-sm hover:bg-pink-200 transition">
                  Edit Personal Details
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Therapy Progress</h2>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-500">Overall Progress</span>
                    <span className="text-sm font-medium text-pink-500">{userData.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${userData.progress}%` }}></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{userData.upcomingSessions}</p>
                    <p className="text-xs text-gray-500 mt-1">Upcoming Sessions</p>
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{userData.completedSessions}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed Sessions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Session History</h2>
              <div className="bg-pink-50 rounded-lg p-4 mb-4">
                <p className="text-pink-600 font-medium">Upcoming Session</p>
                <p className="text-gray-800 mt-2">Thursday, July 15, 2023 • 3:00 PM</p>
                <p className="text-gray-600 text-sm mt-1">With Dr. Michael Chen • 50 minutes</p>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-1 bg-white text-pink-600 border border-pink-200 rounded text-sm font-medium hover:bg-pink-50">Reschedule</button>
                  <button className="px-3 py-1 bg-white text-red-600 border border-red-200 rounded text-sm font-medium hover:bg-red-50">Cancel</button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {[
                  { date: "June 30, 2023", time: "3:00 PM", therapist: "Dr. Michael Chen" },
                  { date: "June 15, 2023", time: "3:00 PM", therapist: "Dr. Michael Chen" },
                  { date: "May 28, 2023", time: "4:30 PM", therapist: "Dr. Michael Chen" },
                ].map((session, index) => (
                  <div key={index} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-gray-800 font-medium">{session.date} • {session.time}</p>
                      <p className="text-gray-500 text-sm">With {session.therapist}</p>
                    </div>
                    <button className="text-gray-500 hover:text-pink-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Therapy Notes</h2>
              <div className="space-y-4">
                {userData.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-pink-500 font-medium">{note.date}</p>
                    <p className="text-gray-700 mt-2">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Settings card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Account Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link to="/settings" className="flex items-center p-3 rounded-lg hover:bg-pink-50 transition group">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Account Settings</h3>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
            </Link>

            <Link to="/settings?tab=security" className="flex items-center p-3 rounded-lg hover:bg-pink-50 transition group">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Security</h3>
                <p className="text-sm text-gray-500">Change password and security settings</p>
              </div>
            </Link>

            <Link to="/settings?tab=notifications" className="flex items-center p-3 rounded-lg hover:bg-pink-50 transition group">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-500">Manage notification preferences</p>
              </div>
            </Link>

            <Link to="/settings?tab=billing" className="flex items-center p-3 rounded-lg hover:bg-pink-50 transition group">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 group-hover:bg-pink-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="font-medium text-gray-800">Billing & Payments</h3>
                <p className="text-sm text-gray-500">Manage payment information</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
