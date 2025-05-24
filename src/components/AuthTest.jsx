import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Signup successful! Check your email.');
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else alert('Login successful!');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    alert('Logged out!');
  };

  return (
    <div className="p-4 flex flex-col gap-3 bg-gray-800 rounded-xl text-gray-200">
      <input
        type="email"
        placeholder="Email"
        className="bg-gray-700 rounded-lg px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="bg-gray-700 rounded-lg px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-2 justify-end">
        <button onClick={handleSignup} className="bg-blue-600 rounded-full px-4 py-1">
          Sign up
        </button>
        <button onClick={handleLogin} className="bg-green-600 rounded-full px-4 py-1">
          Login
        </button>
        <button onClick={handleLogout} className="bg-red-600 rounded-full px-4 py-1">
          Logout
        </button>
      </div>
    </div>
  );
}