import { useState } from 'react';
import { t } from 'i18n';
import { apiFetch } from 'utils/api';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const endpoint = isRegistering ? '/api/register' : '/api/login';
    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || t('Errors.Error'));
        setSuccess('');
        return;
      }
      if (data.token) {
        // TODO: consider secure storage
        localStorage.setItem('jwt', data.token);
      }
      if (isRegistering) {
        setSuccess(t('LoginForm.RegisterSuccess'));
        setEmail('');
        setPassword('');
      }
    } catch (e) {
      setError(String(e?.message || e));
      setSuccess('');
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-page-bg">
      <form
        className="w-full max-w-md p-8 space-y-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.4)] text-gray-200"
        onSubmit={handleSubmit}
      >
        <h2 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-center">
          {t('LoginForm.Title')}
        </h2>
        <h3 className="text-center text-xl font-semibold">
          {isRegistering ? t('LoginForm.Register') : t('LoginForm.Login')}
        </h3>
        {error && <p className="text-red-400 text-center">{error}</p>}
        {success && <p className="text-green-400 text-center">{success}</p>}
        <input
          type="email"
          placeholder={t('LoginForm.EmailPlaceholder')}
          className="field-dark mb-3 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('LoginForm.PasswordPlaceholder')}
          className="field-dark mb-3 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-blue w-full">
          {isRegistering ? t('LoginForm.CreateAccount') : t('LoginForm.Login')}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccess('');
          }}
          className="w-full text-sm text-indigo-400 hover:underline focus:outline-none"
        >
          {isRegistering ? t('LoginForm.ToggleToLogin') : t('LoginForm.ToggleToRegister')}
        </button>
      </form>
    </div>
  );
}
