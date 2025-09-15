import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, FormGroup, Input, Button, Alert } from '../bootstrap';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
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
                <i className="fas fa-sign-in-alt me-2 text-primary"></i>
                Sign In
              </h2>
              <p className="text-muted">Welcome back! Please sign in to your account.</p>
            </div>
            
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <FormGroup label="Email Address" htmlFor="email" required>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </FormGroup>
              
              <FormGroup label="Password" htmlFor="password" required>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </FormGroup>
              
              <div className="d-grid">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  loading={loading}
                  size="lg"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
            
            <div className="text-center mt-4">
              <p className="mb-0">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={onSwitchToRegister} 
                  className="btn btn-link p-0"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
