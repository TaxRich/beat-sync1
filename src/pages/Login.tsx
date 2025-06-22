import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AUTH_SERVER = 'http://localhost:5000';

const Login = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Handle Google OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('auth_token', token);
      fetch(`${AUTH_SERVER}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data));
      // Remove token from URL
      window.history.replaceState({}, document.title, '/login');
    } else {
      // If already logged in
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        fetch(`${AUTH_SERVER}/api/me`, {
          headers: { Authorization: `Bearer ${stored}` }
        })
          .then(res => res.json())
          .then(data => setUser(data));
      }
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${AUTH_SERVER}/auth/google`;
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      <Card className="p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-6 text-white">Sign in to osu!type</h2>
        {user ? (
          <>
            <img src={user.photo} alt="avatar" className="w-20 h-20 rounded-full mx-auto mb-4" />
            <h3 className="text-xl text-pink-300 font-bold mb-2">{user.displayName}</h3>
            <p className="text-pink-200 mb-4">{user.email}</p>
            <Button onClick={handleLogout} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded">Logout</Button>
            <Button onClick={() => navigate('/')} className="w-full mt-2 border-pink-400 text-pink-300" variant="outline">Go to Home</Button>
          </>
        ) : (
          <Button onClick={handleGoogleLogin} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded">
            Sign in with Google
          </Button>
        )}
      </Card>
    </div>
  );
};

export default Login; 