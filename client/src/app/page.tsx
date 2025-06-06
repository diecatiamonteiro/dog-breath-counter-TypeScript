'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Password123!');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true } // Important for cookies
      );
      setResponse(res.data);
      console.log('Login successful:', res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.error('Login error:', err);
    }
  };

  const handleRegister = async () => {
    try {
      setError(null);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        { 
          email, 
          password,
          firstName: 'Test',
          lastName: 'User'
        },
        { withCredentials: true }
      );
      setResponse(res.data);
      console.log('Registration successful:', res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
      
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
        >
          Register
        </button>
        <button
          onClick={handleLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Login
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