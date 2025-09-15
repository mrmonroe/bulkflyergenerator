import React, { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { CompleteUserProfile, INSTRUMENTS, GENRES, SOCIAL_MEDIA_PLATFORMS } from '../types';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'instruments' | 'genres' | 'social'>('basic');

  // Form states
  const [bio, setBio] = useState('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [socialMedia, setSocialMedia] = useState<{ [key: string]: { username: string; url: string } }>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await profileAPI.getProfile();
      setProfile(profileData);
      
      // Set form states
      setBio(profileData.profile?.bio || '');
      setSelectedInstruments(profileData.instruments || []);
      setSelectedGenres(profileData.genres || []);
      
      // Convert social media array to object for easier editing
      const socialObj: { [key: string]: { username: string; url: string } } = {};
      profileData.social_media.forEach((sm: any) => {
        socialObj[sm.platform] = { username: sm.username, url: sm.url || '' };
      });
      setSocialMedia(socialObj);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBasic = async () => {
    try {
      setSaving(true);
      await profileAPI.updateProfile(bio);
      await loadProfile();
    } catch (error) {
      console.error('Failed to save basic info:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInstruments = async () => {
    try {
      setSaving(true);
      await profileAPI.updateInstruments(selectedInstruments);
      await loadProfile();
    } catch (error) {
      console.error('Failed to save instruments:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGenres = async () => {
    try {
      setSaving(true);
      await profileAPI.updateGenres(selectedGenres);
      await loadProfile();
    } catch (error) {
      console.error('Failed to save genres:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialMedia = async (platform: string) => {
    try {
      setSaving(true);
      const social = socialMedia[platform];
      if (social.username) {
        await profileAPI.addSocialMedia(platform, social.username, social.url);
        await loadProfile();
      }
    } catch (error) {
      console.error('Failed to save social media:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSocialMedia = async (platform: string) => {
    try {
      setSaving(true);
      await profileAPI.deleteSocialMedia(platform);
      await loadProfile();
    } catch (error) {
      console.error('Failed to delete social media:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      await profileAPI.uploadPhoto(file);
      await loadProfile();
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev => 
      prev.includes(instrument) 
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const updateSocialMedia = (platform: string, field: 'username' | 'url', value: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  if (loading) {
    return <div className="user-profile-loading">Loading profile...</div>;
  }

  return (
    <div className="user-profile">
      <div className="user-profile-header">
        <h1>My Profile</h1>
        <p>Manage your musician profile and social media presence</p>
      </div>

      <div className="user-profile-tabs">
        <button 
          className={activeTab === 'basic' ? 'active' : ''} 
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={activeTab === 'instruments' ? 'active' : ''} 
          onClick={() => setActiveTab('instruments')}
        >
          Instruments
        </button>
        <button 
          className={activeTab === 'genres' ? 'active' : ''} 
          onClick={() => setActiveTab('genres')}
        >
          Genres
        </button>
        <button 
          className={activeTab === 'social' ? 'active' : ''} 
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
      </div>

      <div className="user-profile-content">
        {activeTab === 'basic' && (
          <div className="profile-section">
            <h2>Basic Information</h2>
            
            <div className="profile-photo-section">
              <div className="profile-photo">
                {profile?.profile?.profile_photo_url ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${profile.profile.profile_photo_url}`} 
                    alt="Profile"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    <span>No photo</span>
                  </div>
                )}
              </div>
              <div className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  id="photo-upload"
                  style={{ display: 'none' }}
                />
                <label htmlFor="photo-upload" className="upload-button">
                  {profile?.profile?.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself as a musician..."
                rows={4}
                maxLength={1000}
                style={{ resize: 'none' }}
              />
              <div className="character-count">
                {bio.length}/1000 characters
              </div>
            </div>

            <button 
              className="save-button" 
              onClick={handleSaveBasic}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Basic Info'}
            </button>
          </div>
        )}

        {activeTab === 'instruments' && (
          <div className="profile-section">
            <h2>Instruments I Play</h2>
            <p>Select all instruments you play (including vocals)</p>
            
            <div className="instruments-grid">
              {INSTRUMENTS.map(instrument => (
                <label key={instrument} className="instrument-item">
                  <input
                    type="checkbox"
                    checked={selectedInstruments.includes(instrument)}
                    onChange={() => toggleInstrument(instrument)}
                  />
                  <span>{instrument}</span>
                </label>
              ))}
            </div>

            <button 
              className="save-button" 
              onClick={handleSaveInstruments}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Instruments'}
            </button>
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="profile-section">
            <h2>Music Genres</h2>
            <p>Select the genres you play</p>
            
            <div className="genres-grid">
              {GENRES.map(genre => (
                <label key={genre} className="genre-item">
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                  />
                  <span>{genre}</span>
                </label>
              ))}
            </div>

            <button 
              className="save-button" 
              onClick={handleSaveGenres}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Genres'}
            </button>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="profile-section">
            <h2>Social Media Profiles</h2>
            <p>Add your social media profiles to share your music</p>
            
            <div className="social-media-list">
              {SOCIAL_MEDIA_PLATFORMS.map(platform => {
                const social = socialMedia[platform];
                const hasProfile = profile?.social_media?.some(sm => sm.platform === platform);
                
                return (
                  <div key={platform} className="social-media-item">
                    <div className="platform-name">{platform}</div>
                    <div className="platform-fields">
                      <input
                        type="text"
                        placeholder="Username"
                        value={social?.username || ''}
                        onChange={(e) => updateSocialMedia(platform, 'username', e.target.value)}
                      />
                      <input
                        type="url"
                        placeholder="URL (optional)"
                        value={social?.url || ''}
                        onChange={(e) => updateSocialMedia(platform, 'url', e.target.value)}
                      />
                      <div className="social-actions">
                        {hasProfile ? (
                          <>
                            <button 
                              className="save-social-button"
                              onClick={() => handleSaveSocialMedia(platform)}
                              disabled={saving || !social?.username}
                            >
                              Update
                            </button>
                            <button 
                              className="delete-social-button"
                              onClick={() => handleDeleteSocialMedia(platform)}
                              disabled={saving}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button 
                            className="add-social-button"
                            onClick={() => handleSaveSocialMedia(platform)}
                            disabled={saving || !social?.username}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
