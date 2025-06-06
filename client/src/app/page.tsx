'use client';

import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface ApiResponse {
  message: string;
  data?: {
    user: {
      email: string;
      firstName: string;
      lastName: string;
      _id: string;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export default function TestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Password123!');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    // Log the API URL when component mounts
    const url = process.env.NEXT_PUBLIC_API_URL || 'Not set';
    console.log('API URL:', url);
    setApiUrl(url);
  }, []);

  // Check authentication status
  const checkAuth = async () => {
    try {
      console.log('Checking auth at:', `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`);
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/me`,
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      setIsAuthenticated(true);
      setResponse(res.data);
      console.log('Auth check successful:', res.data);
    } catch (err) {
      setIsAuthenticated(false);
      console.log('Auth check failed:', err);
      // Don't set error here as this is just a check
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      console.log('Attempting login at:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`);
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      setResponse(res.data);
      setIsAuthenticated(true);
      console.log('Login successful:', res.data);
      console.log('Cookies after login:', document.cookie);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || error.message);
      setIsAuthenticated(false);
      console.error('Login error:', error);
    }
  };

  const handleRegister = async () => {
    try {
      setError(null);
      console.log('Attempting registration at:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`);
      const res = await axios.post<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        { 
          email, 
          password,
          firstName: 'Test',
          lastName: 'User'
        },
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      setResponse(res.data);
      setIsAuthenticated(true);
      console.log('Registration successful:', res.data);
      console.log('Cookies after registration:', document.cookie);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || error.message);
      setIsAuthenticated(false);
      console.error('Registration error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      console.log('Attempting logout at:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`);
      console.log('Cookies before logout:', document.cookie);
      const res = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        { 
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );
      setResponse(res.data);
      setIsAuthenticated(false);
      console.log('Logout successful:', res.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || error.message);
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">API URL: {apiUrl}</p>
        <p className={`text-lg ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </p>
      </div>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        
        <div>
          <label className="block mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
      </div>

      <div className="space-x-4 mb-8">
        <button
          onClick={handleRegister}
          className="bg-green-500 text-white px-4 py-2 rounded"
          disabled={isAuthenticated}
        >
          Register
        </button>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isAuthenticated}
        >
          Login
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={!isAuthenticated}
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {response && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 