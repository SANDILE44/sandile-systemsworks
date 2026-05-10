import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = "https://systems-j894.onrender.com".replace(/\/$/, "");
const API_URL = `${BASE_URL}/api/auth/register`;

const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          companyName: formData.companyName.trim(),
          phoneNumber: formData.phoneNumber.trim() || "N/A",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'REGISTRATION_FAILED');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data._id);

        navigate('/dashboard');
      } else {
        setError('INVALID_RESPONSE');
      }

    } catch (err) {
      setError('NETWORK_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-500/30 rounded-3xl p-8">

        <h1 className="text-2xl font-black text-emerald-500 text-center mb-6">
          Register
        </h1>

        <form onSubmit={handleRegister} className="space-y-4">

          <input
            type="text"
            placeholder="Company Name"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            onChange={(e) =>
              setFormData({ ...formData, companyName: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <input
            type="tel"
            placeholder="Phone (optional)"
            className="w-full p-3 bg-black border border-zinc-700 rounded"
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-black font-bold py-3 rounded"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>

        </form>

        <p className="text-center text-zinc-500 text-xs mt-4">
          Already have an account?
        </p>

      </div>
    </div>
  );
};

export default RegisterPage;
