import { useState } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SignupPage() {
  const { navigate } = useNav();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else {
      navigate('home');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Create Account</h1>
          <p className="text-chocolate-500">Join the student rental marketplace.</p>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 rounded-xl bg-sand-200 text-chocolate-700 text-sm text-center">
            Database is not connected. Authentication requires Supabase.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-chocolate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-chocolate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-chocolate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Creating account...' : 'Create Account'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-chocolate-500">
          Already have an account?{' '}
          <button
            onClick={() => navigate('login')}
            className="font-semibold text-chocolate-800 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
