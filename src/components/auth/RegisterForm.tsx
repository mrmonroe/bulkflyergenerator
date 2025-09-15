import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, FormGroup, Input, Button, Alert } from '../bootstrap';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName || undefined,
        formData.lastName || undefined
      );
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <Card className="mt-5 shadow">
            <div className="text-center mb-4">
              <h2 className="h3 mb-2">
                <i className="fas fa-user-plus me-2 text-primary"></i>
                Create Account
              </h2>
              <p className="text-muted">Join us to start creating amazing flyers!</p>
            </div>
            
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup label="First Name" htmlFor="firstName">
                    <Input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your first name"
                    />
                  </FormGroup>
                </div>
                
                <div className="col-md-6">
                  <FormGroup label="Last Name" htmlFor="lastName">
                    <Input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Enter your last name"
                    />
                  </FormGroup>
                </div>
              </div>
              
              <FormGroup label="Email Address" htmlFor="email" required>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </FormGroup>
              
              <FormGroup 
                label="Password" 
                htmlFor="password" 
                required
              >
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Create a strong password"
                  helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                />
              </FormGroup>
              
              <FormGroup label="Confirm Password" htmlFor="confirmPassword" required>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Confirm your password"
                />
              </FormGroup>
              
              <div className="d-grid">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  loading={loading}
                  size="lg"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p className="mb-0">
                Already have an account?{' '}
                <button 
                  type="button" 
                  onClick={onSwitchToLogin} 
                  className="btn btn-link p-0"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
