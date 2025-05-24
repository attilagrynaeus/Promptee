import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function LoginForm() {
  const supabase = useSupabaseClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-page-bg">
      <form className="p-8 bg-white rounded shadow" onSubmit={handleLogin}>
        <h2 className="mb-4 text-2xl font-bold text-gray-800">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="field-dark mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="field-dark mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-blue w-full">
          Login
        </button>
      </form>
    </div>
  );
}
