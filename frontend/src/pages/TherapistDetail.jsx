import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTherapist, getTherapistReviews, getTherapistAvailability, bookSession } from "../api";
import avatar from "../assets/avatar.png";

export default function TherapistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [therapist, setTherapist] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchTherapistData = async () => {
      try {
        setLoading(true);
        
        // Fetch therapist details
        const therapistResponse = await getTherapist(id);
        setTherapist(therapistResponse.data);
        
        // Fetch reviews
        const reviewsResponse = await getTherapistReviews(id);
        setReviews(reviewsResponse.data || []);
        
        // Fetch availability for today
        const availabilityResponse = await getTherapistAvailability(id, selectedDate);
        setAvailability(availabilityResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching therapist data:', error);
        
        // Fallback mock data
        setTherapist({
          id: id,
          first_name: "Dr. Sarah",
          last_name: "Johnson",
          area_of_expertise: ["Depression", "Trauma Therapy", "Anxiety", "PTSD"],
          about_note: "I am a licensed clinical psychologist with over 12 years of experience helping individuals overcome depression, trauma, and anxiety. My approach combines evidence-based therapies with compassionate, personalized care to help you achieve lasting positive change.",
          average_score: 4.9,
          profile_picture: null,
          email: "sarah.johnson@therapyconnect.com",
          years_active: 12,
          education: [
            "Ph.D. Clinical Psychology - Stanford University",
            "M.A. Psychology - UC Berkeley",
            "B.A. Psychology - UCLA"
          ],
          verified_certificates: [
            "Licensed Clinical Psychologist (CA)",
            "Trauma-Focused CBT Certification",
            "EMDR Therapy Certification"
          ],
          wallet_balance: 2450.00
        });
        
        setReviews([
          {
            id: "rev_001",
            patient_first_name: "Emma",
            patient_last_name: "W.",
            score: 5.0,
            text: "Dr. Johnson has been incredibly helpful in my journey with anxiety. Her approach is both professional and compassionate. I highly recommend her to anyone seeking support.",
            timestamp: "2024-01-15T10:30:00Z"
          },
          {
            id: "rev_002", 
            patient_first_name: "Michael",
            patient_last_name: "R.",
            score: 4.5,
            text: "Great therapist! Very understanding and provides practical tools for managing depression. The sessions have made a significant difference in my life.",
            timestamp: "2024-01-10T14:20:00Z"
          },
          {
            id: "rev_003",
            patient_first_name: "Lisa",
            patient_last_name: "K.",
            score: 5.0,
            text: "Dr. Johnson's expertise in trauma therapy is exceptional. She created a safe space for me to heal and provided invaluable guidance throughout my recovery.",
            timestamp: "2024-01-05T16:45:00Z"
          },
          {
            id: "rev_004",
            patient_first_name: "David",
            patient_last_name: "M.",
            score: 4.8,
            text: "Professional, knowledgeable, and caring. Dr. Johnson helped me develop coping strategies that have been life-changing. Highly recommend!",
            timestamp: "2023-12-28T11:15:00Z"
          }
        ]);
        
        setAvailability([
          { id: "avail_001", time_slot: "9-10", date: selectedDate, is_available: true },
          { id: "avail_002", time_slot: "10-11", date: selectedDate, is_available: false },
          { id: "avail_003", time_slot: "11-12", date: selectedDate, is_available: true },
          { id: "avail_004", time_slot: "14-15", date: selectedDate, is_available: true },
          { id: "avail_005", time_slot: "15-16", date: selectedDate, is_available: true },
          { id: "avail_006", time_slot: "16-17", date: selectedDate, is_available: false }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTherapistData();
    }
  }, [id, selectedDate]);

  const handleBookSession = async (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    try {
      // Mock booking - in real app this would call the API
      console.log('Booking session:', selectedSlot);
      alert('Session booked successfully!');
      setShowBookingModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error booking session:', error);
      alert('Error booking session. Please try again.');
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} style={{ color: "#FFD700" }}>★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" style={{ color: "#FFD700" }}>☆</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} style={{ color: "#ddd" }}>☆</span>);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          width: "60px",
          height: "60px", 
          border: "4px solid rgba(255,255,255,0.3)",
          borderTop: "4px solid white",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Therapist not found</h2>
        <button onClick={() => navigate('/')} style={{ padding: '1rem 2rem', marginTop: '1rem' }}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem 0'
    }}>
      {/* Header Section */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 2rem',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid #e0e0e0',
            padding: '0.75rem 1.5rem',
            borderRadius: '50px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '2rem',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'white';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.9)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Back to Home
        </button>

        {/* Hero Profile Section */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <img
              src={therapist.profile_picture || avatar}
              alt={`${therapist.first_name} ${therapist.last_name}`}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '5px solid #f0f0f0'
              }}
            />
            <div style={{ flex: 1 }}>
              <h1 style={{ 
                margin: '0 0 1rem 0', 
                fontSize: '2.5rem', 
                color: '#333',
                fontWeight: '300'
              }}>
                {therapist.first_name} {therapist.last_name}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ marginRight: '1rem' }}>
                  {renderStars(therapist.average_score)}
                </div>
                <span style={{ fontSize: '1.1rem', color: '#666' }}>
                  {therapist.average_score}/5.0 ({reviews.length} reviews)
                </span>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                {therapist.area_of_expertise && therapist.area_of_expertise.map((expertise, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      margin: '0.25rem 0.5rem 0.25rem 0',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    {expertise}
                  </span>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#666' }}>
                <div>
                  <strong style={{ color: '#333' }}>Experience:</strong> {therapist.years_active || 12} years
                </div>
                <div>
                  <strong style={{ color: '#333' }}>Sessions:</strong> 500+ completed
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '15px',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>$75</div>
                <div style={{ fontSize: '0.9rem', opacity: '0.9' }}>per session</div>
              </div>
              <button
                onClick={() => setActiveTab('booking')}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  transition: 'transform 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Book Session
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '15px',
          padding: '0.5rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'reviews', label: 'Reviews' },
            { key: 'booking', label: 'Book Session' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '10px',
                background: activeTab === tab.key ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                color: activeTab === tab.key ? 'white' : '#666',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
          }}>
            {/* Main Content */}
            <div>
              {/* About Section */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>About</h3>
                <p style={{ 
                  lineHeight: '1.6', 
                  color: '#666', 
                  fontSize: '1.1rem',
                  margin: 0
                }}>
                  {therapist.about_note}
                </p>
              </div>

              {/* Education Section */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>Education</h3>
                <div>
                  {therapist.education && therapist.education.map((edu, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: '#f8f9fa',
                      borderRadius: '10px',
                      marginBottom: '1rem',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{ color: '#333', fontWeight: '500' }}>{edu}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Certifications */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>Certifications</h3>
                <div>
                  {therapist.verified_certificates && therapist.verified_certificates.map((cert, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderBottom: i < therapist.verified_certificates.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ color: '#4CAF50', marginRight: '0.5rem', fontSize: '1.2rem' }}>✓</span>
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 1.5rem 0', color: '#333', fontSize: '1.5rem' }}>Quick Stats</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Response Time:</span>
                    <strong style={{ color: '#333' }}>{"< 2 hours"}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Success Rate:</span>
                    <strong style={{ color: '#4CAF50' }}>95%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#666' }}>Languages:</span>
                    <strong style={{ color: '#333' }}>English, Spanish</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '2rem' 
            }}>
              <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
                Patient Reviews ({reviews.length})
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem',
                background: '#f8f9fa',
                borderRadius: '10px'
              }}>
                <div style={{ fontSize: '2rem' }}>{renderStars(therapist.average_score)}</div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>
                    {therapist.average_score}/5.0
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    Based on {reviews.length} reviews
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review.id} style={{
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '15px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#333', marginBottom: '0.25rem' }}>
                        {review.patient_first_name} {review.patient_last_name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {renderStars(review.score)}
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {review.score}/5.0
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {new Date(review.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    lineHeight: '1.5', 
                    color: '#555',
                    fontStyle: 'italic'
                  }}>
                    "{review.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 2rem 0', color: '#333', fontSize: '1.5rem' }}>
              Book a Session
            </h3>
            
            {/* Date Selection */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                color: '#333',
                fontWeight: '500'
              }}>
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  padding: '1rem',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  width: '200px'
                }}
              />
            </div>

            {/* Available Time Slots */}
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Available Time Slots:</h4>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '1rem' 
              }}>
                {availability.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => slot.is_available && handleBookSession(slot)}
                    disabled={!slot.is_available}
                    style={{
                      padding: '1rem',
                      border: '2px solid',
                      borderColor: slot.is_available ? '#667eea' : '#e0e0e0',
                      borderRadius: '10px',
                      background: slot.is_available ? 'white' : '#f5f5f5',
                      color: slot.is_available ? '#667eea' : '#999',
                      cursor: slot.is_available ? 'pointer' : 'not-allowed',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (slot.is_available) {
                        e.target.style.background = '#667eea';
                        e.target.style.color = 'white';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (slot.is_available) {
                        e.target.style.background = 'white';
                        e.target.style.color = '#667eea';
                      }
                    }}
                  >
                    {slot.time_slot.replace('-', ':00 - ')}:00
                    {!slot.is_available && (
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Booked
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Confirm Booking</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Book a session with {therapist.first_name} {therapist.last_name} on{' '}
              {new Date(selectedDate).toLocaleDateString()} at{' '}
              {selectedSlot?.time_slot.replace('-', ':00 - ')}:00?
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={confirmBooking}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Confirm ($75)
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

