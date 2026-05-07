import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ErrorBanner } from '../common/ErrorBanner.jsx';
import { getErrorMessage } from '../../utils/errors.js';
import { useAuthStore } from '../../store/authStore.js';

export function AuthForm({ mode }) {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const status = useAuthStore((state) => state.status);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState(null);
  const isRegister = mode === 'register';
  const loading = status === 'loading';

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError(null);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login(form.email);
      }

      navigate('/', { replace: true });
    } catch (requestError) {
      setError(new Error(getErrorMessage(requestError)));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-[#111827] p-6 shadow-2xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-emerald-300">Human Chat</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isRegister ? 'Register with a unique email.' : 'Sign in with your email.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <ErrorBanner error={error} />

          {isRegister && (
            <label className="block">
              <span className="text-sm text-slate-300">Name</span>
              <input
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400"
                name="name"
                value={form.name}
                onChange={updateField}
                minLength={2}
                maxLength={80}
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm text-slate-300">Email</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 outline-none focus:border-emerald-400"
              name="email"
              value={form.email}
              onChange={updateField}
              type="email"
              required
              autoComplete="email"
            />
          </label>

          <button
            className="w-full rounded-md bg-emerald-500 px-4 py-3 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Please wait...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isRegister ? 'Already registered?' : 'Need an account?'}{' '}
          <Link className="font-medium text-emerald-300 hover:text-emerald-200" to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Login' : 'Register'}
          </Link>
        </p>
      </div>
    </div>
  );
}
