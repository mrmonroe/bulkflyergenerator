import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Spinner, Alert, FormGroup, Input } from './bootstrap';
import api from '../services/api';

interface PublicShow {
  id: number;
  date: string;
  venue_name: string;
  venue_address?: string;
  city_state?: string;
  show_time?: string;
  event_type?: string;
  latitude?: number;
  longitude?: number;
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_photo_url?: string;
}

const PublicShows: React.FC = () => {
  const [shows, setShows] = useState<PublicShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
        }
      );
    } else {
      setLocationPermission('denied');
    }
  };

  const fetchShows = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
        params.append('radius', radius.toString());
      }
      
      const response = await api.get(`/shows/public?${params.toString()}`);
      setShows(response.data.shows);
    } catch (err) {
      console.error('Error fetching shows:', err);
      setError('Failed to load shows. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userLocation, radius]);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const handleLocationSearch = () => {
    fetchShows();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Public Shows</h1>
          <p className="text-muted mb-4">
            Discover live music shows happening near you. Shows are sorted by date and location.
          </p>
        </div>
      </div>

      {/* Location Controls */}
      <Card className="mb-4">
        <h5>Find Shows Near You</h5>
        {locationPermission === 'denied' && (
          <Alert variant="warning">
            Location access denied. You can still view all shows, but they won't be sorted by distance.
          </Alert>
        )}
        
        {userLocation ? (
          <div>
            <p className="text-success mb-3">
              <i className="bi bi-geo-alt-fill"></i> 
              Location detected: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
            <div className="row">
              <div className="col-md-6">
                <FormGroup label="Search Radius (miles)" htmlFor="radius">
                  <Input
                    type="number"
                    id="radius"
                    min="1"
                    max="500"
                    value={radius}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRadius(parseInt(e.target.value))}
                  />
                </FormGroup>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <Button onClick={handleLocationSearch} variant="primary">
                  Search Shows
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-muted mb-3">
              Allow location access to find shows near you, or view all shows below.
            </p>
            <Button onClick={requestLocation} variant="outline-primary">
              Enable Location
            </Button>
          </div>
        )}
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Shows List */}
      {shows.length === 0 ? (
        <Card bodyClassName="text-center py-5">
          <h5 className="text-muted">No public shows found</h5>
          <p className="text-muted">
            {userLocation 
              ? `No shows found within ${radius} miles of your location.`
              : 'No shows have been made public yet.'
            }
          </p>
        </Card>
      ) : (
        <div className="row">
          {shows.map((show) => (
            <div key={show.id} className="col-md-6 col-lg-4 mb-4">
              <Card className="h-100">
                <div className="d-flex align-items-start mb-3">
                  {show.profile_photo_url ? (
                    <img
                      src={show.profile_photo_url}
                      alt="Profile"
                      className="rounded-circle me-3"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-secondary text-white"
                      style={{ width: '50px', height: '50px' }}
                    >
                      {show.first_name?.[0] || '?'}
                    </div>
                  )}
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      {show.first_name && show.last_name 
                        ? `${show.first_name} ${show.last_name}`
                        : 'Anonymous Artist'
                      }
                    </h6>
                    {show.bio && (
                      <small className="text-muted">{show.bio}</small>
                    )}
                  </div>
                </div>

                <h5 className="card-title">{show.venue_name}</h5>
                
                <div className="mb-2">
                  <strong>Date:</strong> {formatDate(show.date)}
                </div>
                
                {show.show_time && (
                  <div className="mb-2">
                    <strong>Time:</strong> {formatTime(show.show_time)}
                  </div>
                )}
                
                {show.venue_address && (
                  <div className="mb-2">
                    <strong>Address:</strong> {show.venue_address}
                  </div>
                )}
                
                {show.city_state && (
                  <div className="mb-2">
                    <strong>Location:</strong> {show.city_state}
                  </div>
                )}
                
                {show.event_type && (
                  <div className="mb-2">
                    <strong>Event Type:</strong> {show.event_type}
                  </div>
                )}

                {userLocation && show.latitude && show.longitude && (
                  <div className="mb-2">
                    <strong>Distance:</strong> {getDistance(
                      userLocation.lat, 
                      userLocation.lng, 
                      show.latitude, 
                      show.longitude
                    ).toFixed(1)} miles
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicShows;
