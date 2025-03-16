import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("details");
  const fileInputRef = useRef();

  // Hardcoded user data for testing
  const user = {
    avatar: "https://via.placeholder.com/150", // Placeholder image URL
    name: "Alex JJJJJJ",
    email: "alex.johnson@example.com",
    phone: "(555) 123-4567",
    dateOfBirth: "May 15, 1988",
    therapyGoals: "Manage anxiety, improve work-life balance, develop coping mechanisms for stress",
  };

  // Therapy concept images
  const therapyImages = [
    {
      url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      alt: "Peaceful meditation",
      title: "Mindfulness"
    },
    {
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      alt: "Calm beach scene",
      title: "Serenity"
    },
    {
      url: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      alt: "Person journaling",
      title: "Reflection"
    }
  ];

  // Sample therapy sessions data
  const upcomingSessions = [
    {
      therapist: "Dr. Sarah Williams",
      topic: "Anxiety Management",
      date: "May 10, 2023",
      time: "2:00 PM - 3:00 PM",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      therapist: "Dr. Michael Chen",
      topic: "Stress Reduction",
      date: "May 17, 2023",
      time: "3:30 PM - 4:30 PM",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    }
  ];

  const pastSessions = [
    {
      therapist: "Dr. Sarah Williams",
      topic: "Initial Consultation",
      date: "April 26, 2023",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    },
    {
      therapist: "Dr. Sarah Williams",
      topic: "Goal Setting",
      date: "April 19, 2023",
      image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
    }
  ];

  // Sample journal entries data
  const journalEntries = [
    {
      title: "Reflecting on Progress",
      date: "May 5, 2023",
      mood: "Positive",
      content: "Today was a good day. I practiced the mindfulness techniques Dr. Williams suggested, and I found myself feeling much more grounded throughout the workday. The breathing exercises really help when I feel overwhelmed...",
      color: "pink"
    },
    {
      title: "Challenging Day",
      date: "April 28, 2023",
      mood: "Neutral",
      content: "I had a difficult conversation with a coworker today. I tried to use the communication strategies we discussed in our last session. While the conversation was still challenging, I feel I handled it better than I would have before...",
      color: "gray"
    },
    {
      title: "New Insights",
      date: "April 22, 2023",
      mood: "Positive",
      content: "During my meditation today, I had a realization about my anxiety triggers. I noticed that I tend to feel most anxious when I'm uncertain about expectations. I'm going to discuss this with Dr. Williams in our next session...",
      color: "pink"
    }
  ];

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Avatar updated:", reader.result); // Log the new avatar data URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen font-inter" style={{ background: "linear-gradient(to bottom, #f8f4f1, #ffffff)" }}>
      {/* Header with back navigation */}
      <header className="py-6 px-8 flex items-center">
        <Link to="/" className="text-gray-600 hover:text-pink-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-700 ml-4">My Profile</h1>
      </header>

      {/* Profile content container */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {/* Profile card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-md overflow-hidden mb-8"
        >
          {/* Profile header with cover and avatar */}
          <div className="h-40 bg-gradient-to-r from-pink-100 to-pink-200 relative">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div 
                className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white cursor-pointer group relative"
                onClick={handleAvatarClick}
              >
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="ml-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-700">{user.name}</h2>
                <p className="text-gray-500">Member since 2023</p>
              </div>
            </div>
          </div>

          {/* Profile tabs */}
          <div className="pt-20 px-8">
            <div className="flex border-b border-gray-200">
              <button 
                className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === "details" ? "border-b-2 border-pink-400 text-pink-500" : "text-gray-400 hover:text-gray-600"}`}
                onClick={() => setActiveTab("details")}
              >
                Personal Details
              </button>
              <button 
                className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === "sessions" ? "border-b-2 border-pink-400 text-pink-500" : "text-gray-400 hover:text-gray-600"}`}
                onClick={() => setActiveTab("sessions")}
              >
                Therapy Sessions
              </button>
              <button 
                className={`pb-4 px-4 font-medium text-sm transition-colors ${activeTab === "journal" ? "border-b-2 border-pink-400 text-pink-500" : "text-gray-400 hover:text-gray-600"}`}
                onClick={() => setActiveTab("journal")}
              >
                Journal
              </button>
            </div>

            {/* Tab contents */}
            <div className="py-8">
              {activeTab === "details" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-gray-700">{user.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                      <p className="text-gray-700">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                      <p className="text-gray-700">{user.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                      <p className="text-gray-700">{user.dateOfBirth}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Therapy Goals</label>
                    <p className="text-gray-700">{user.therapyGoals}</p>
                  </div>
                  
                  <button className="mt-4 px-6 py-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-lg transition flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </button>

                  {/* Therapy concept images */}
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Therapy Concepts</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {therapyImages.map((image, index) => (
                        <div key={index} className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                          <img 
                            src={image.url} 
                            alt={image.alt} 
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                            <p className="text-white font-medium p-4">{image.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "sessions" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700">Therapy Sessions</h3>
                    <button className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-lg transition text-sm">
                      Book New Session
                    </button>
                  </div>
                  
                  {/* Sessions board */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upcoming sessions column */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upcoming Sessions
                      </h4>
                      <div className="space-y-4">
                        {upcomingSessions.map((session, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
                            <div className="flex">
                              <img 
                                src={session.image} 
                                alt={session.therapist} 
                                className="w-16 h-16 rounded-full object-cover mr-4" 
                              />
                              <div className="flex-1">
                                <p className="text-pink-500 font-medium">{session.therapist}</p>
                                <p className="text-gray-700">{session.topic}</p>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {session.date}
                                </div>
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {session.time}
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end mt-3 space-x-2">
                              <button className="px-3 py-1 bg-white text-pink-500 border border-pink-200 rounded text-sm hover:bg-pink-50 transition">
                                Reschedule
                              </button>
                              <button className="px-3 py-1 bg-white text-gray-500 border border-gray-200 rounded text-sm hover:bg-gray-50 transition">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Past sessions column */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Past Sessions
                      </h4>
                      <div className="space-y-4">
                        {pastSessions.map((session, index) => (
                          <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
                            <div className="flex">
                              <img 
                                src={session.image} 
                                alt={session.therapist} 
                                className="w-16 h-16 rounded-full object-cover mr-4 grayscale" 
                              />
                              <div className="flex-1">
                                <p className="text-gray-600 font-medium">{session.therapist}</p>
                                <p className="text-gray-600">{session.topic}</p>
                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {session.date}
                                </div>
                              </div>
                              <button className="px-3 py-1 h-8 bg-white text-gray-500 border border-gray-200 rounded text-sm hover:bg-gray-50 transition">
                                View Notes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "journal" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-700">Journal Board</h3>
                    <button className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-lg transition text-sm flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      New Entry
                    </button>
                  </div>
                  
                  {/* Journal board */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {journalEntries.map((entry, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
                        className={`p-5 bg-white rounded-lg border border-${entry.color}-100 shadow-sm hover:shadow-md transition`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-700">{entry.title}</h4>
                            <p className="text-gray-500 text-sm mt-1">{entry.date}</p>
                          </div>
                          <div className={`bg-${entry.color}-50 text-${entry.color}-500 px-2 py-1 rounded text-xs`}>
                            {entry.mood}
                          </div>
                        </div>
                        <p className="text-gray-600 mt-3 line-clamp-4">
                          {entry.content}
                        </p>
                        <button className={`mt-3 text-${entry.color}-500 text-sm font-medium hover:text-${entry.color}-600 transition`}>
                          Read more
                        </button>
                      </motion.div>
                    ))}
                    
                    {/* Add new journal entry card */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                      className="p-5 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <p className="text-gray-600 font-medium">Add New Entry</p>
                      <p className="text-gray-400 text-sm mt-1">Record your thoughts and feelings</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Additional profile sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-700 mb-4">Mood Tracker</h3>
            <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
              {/* Placeholder for mood chart */}
              <p className="text-gray-400">Mood trends visualization</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-medium text-gray-700 mb-4">Resources</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 hover:text-pink-500 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Anxiety Management Guide
              </li>
              <li className="flex items-center text-gray-600 hover:text-pink-500 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Guided Meditation Videos
              </li>
              <li className="flex items-center text-gray-600 hover:text-pink-500 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Weekly Mindfulness Calendar
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}s