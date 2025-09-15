import React, { useState, useEffect } from 'react';
import { profileAPI } from '../services/api';
import { CompleteUserProfile, INSTRUMENTS, GENRES, SOCIAL_MEDIA_PLATFORMS } from '../types';
import { Card, Button, FormGroup, Textarea, Input, Alert, Spinner, Modal } from './bootstrap';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<CompleteUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'instruments' | 'genres' | 'social'>('basic');
  const [showPhotoModal, setShowPhotoModal] = useState(false);

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
      setShowPhotoModal(false);
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
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner size="lg" className="mb-3" />
          <h4>Loading profile...</h4>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <Card className="mb-4">
            <div className="text-center">
              <h1 className="display-5 mb-3">
                <i className="fas fa-user-circle me-3 text-primary"></i>
                My Profile
              </h1>
              <p className="lead text-muted">Manage your musician profile and social media presence</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Card>
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                    type="button"
                  >
                    <i className="fas fa-user me-2"></i>
                    Basic Info
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'instruments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('instruments')}
                    type="button"
                  >
                    <i className="fas fa-music me-2"></i>
                    Instruments
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'genres' ? 'active' : ''}`}
                    onClick={() => setActiveTab('genres')}
                    type="button"
                  >
                    <i className="fas fa-tags me-2"></i>
                    Genres
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                    type="button"
                  >
                    <i className="fas fa-share-alt me-2"></i>
                    Social Media
                  </button>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {activeTab === 'basic' && (
                <div className="row">
                  <div className="col-12 col-md-4 mb-4">
                    <Card className="h-100">
                      <div className="card-body text-center">
                        <div className="profile-photo-container mb-3">
                          {profile?.profile?.profile_photo_url ? (
                            <img 
                              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${profile.profile.profile_photo_url}`} 
                              alt="Profile"
                              className="img-fluid rounded-circle"
                              style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center bg-light"
                              style={{ width: '150px', height: '150px', margin: '0 auto' }}
                            >
                              <i className="fas fa-user fa-3x text-muted"></i>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline-primary"
                          onClick={() => setShowPhotoModal(true)}
                          disabled={saving}
                        >
                          <i className="fas fa-camera me-2"></i>
                          {profile?.profile?.profile_photo_url ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div className="col-12 col-md-8">
                    <Card>
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="fas fa-edit me-2"></i>
                          Basic Information
                        </h5>
                        
                        <FormGroup label="Bio" htmlFor="bio">
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself as a musician..."
                            rows={6}
                            maxLength={1000}
                            style={{ resize: 'none' }}
                          />
                          <div className="form-text text-end">
                            {bio.length}/1000 characters
                          </div>
                        </FormGroup>

                        <div className="d-grid">
                          <Button 
                            onClick={handleSaveBasic}
                            disabled={saving}
                            loading={saving}
                            size="lg"
                          >
                            <i className="fas fa-save me-2"></i>
                            {saving ? 'Saving...' : 'Save Basic Info'}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'instruments' && (
                <div>
                  <h5 className="mb-3">
                    <i className="fas fa-music me-2"></i>
                    Instruments I Play
                  </h5>
                  <p className="text-muted mb-4">Select all instruments you play (including vocals)</p>
                  
                  <div className="row">
                    {INSTRUMENTS.map(instrument => (
                      <div key={instrument} className="col-6 col-md-4 col-lg-3 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`instrument-${instrument}`}
                            checked={selectedInstruments.includes(instrument)}
                            onChange={() => toggleInstrument(instrument)}
                          />
                          <label className="form-check-label" htmlFor={`instrument-${instrument}`}>
                            {instrument}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-grid d-md-flex justify-content-md-end mt-4">
                    <Button 
                      onClick={handleSaveInstruments}
                      disabled={saving}
                      loading={saving}
                      size="lg"
                    >
                      <i className="fas fa-save me-2"></i>
                      {saving ? 'Saving...' : 'Save Instruments'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'genres' && (
                <div>
                  <h5 className="mb-3">
                    <i className="fas fa-tags me-2"></i>
                    Music Genres
                  </h5>
                  <p className="text-muted mb-4">Select the genres you play</p>
                  
                  <div className="row">
                    {GENRES.map(genre => (
                      <div key={genre} className="col-6 col-md-4 col-lg-3 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`genre-${genre}`}
                            checked={selectedGenres.includes(genre)}
                            onChange={() => toggleGenre(genre)}
                          />
                          <label className="form-check-label" htmlFor={`genre-${genre}`}>
                            {genre}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-grid d-md-flex justify-content-md-end mt-4">
                    <Button 
                      onClick={handleSaveGenres}
                      disabled={saving}
                      loading={saving}
                      size="lg"
                    >
                      <i className="fas fa-save me-2"></i>
                      {saving ? 'Saving...' : 'Save Genres'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div>
                  <h5 className="mb-3">
                    <i className="fas fa-share-alt me-2"></i>
                    Social Media Profiles
                  </h5>
                  <p className="text-muted mb-4">Add your social media profiles to share your music</p>
                  
                  <div className="row">
                    {SOCIAL_MEDIA_PLATFORMS.map(platform => {
                      const social = socialMedia[platform];
                      const hasProfile = profile?.social_media?.some(sm => sm.platform === platform);
                      
                      return (
                        <div key={platform} className="col-12 col-md-6 mb-4">
                          <Card>
                            <div className="card-body">
                              <h6 className="card-title d-flex align-items-center">
                                <i className={`fab fa-${platform.toLowerCase()} me-2`}></i>
                                {platform}
                              </h6>
                              
                              <div className="row g-3">
                                <div className="col-12">
                                  <Input
                                    type="text"
                                    placeholder="Username"
                                    value={social?.username || ''}
                                    onChange={(e) => updateSocialMedia(platform, 'username', e.target.value)}
                                  />
                                </div>
                                <div className="col-12">
                                  <Input
                                    type="url"
                                    placeholder="URL (optional)"
                                    value={social?.url || ''}
                                    onChange={(e) => updateSocialMedia(platform, 'url', e.target.value)}
                                  />
                                </div>
                                <div className="col-12">
                                  <div className="d-flex gap-2">
                                    {hasProfile ? (
                                      <>
                                        <Button
                                          variant="success"
                                          size="sm"
                                          onClick={() => handleSaveSocialMedia(platform)}
                                          disabled={saving || !social?.username}
                                          loading={saving}
                                        >
                                          <i className="fas fa-save me-1"></i>
                                          Update
                                        </Button>
                                        <Button
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleDeleteSocialMedia(platform)}
                                          disabled={saving}
                                        >
                                          <i className="fas fa-trash me-1"></i>
                                          Delete
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleSaveSocialMedia(platform)}
                                        disabled={saving || !social?.username}
                                        loading={saving}
                                      >
                                        <i className="fas fa-plus me-1"></i>
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <Modal
        show={showPhotoModal}
        onHide={() => setShowPhotoModal(false)}
        title="Upload Profile Photo"
        centered
      >
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            id="photo-upload"
            className="form-control mb-3"
          />
          <p className="text-muted">
            <i className="fas fa-info-circle me-2"></i>
            Choose a square image for best results. Maximum file size: 5MB
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;