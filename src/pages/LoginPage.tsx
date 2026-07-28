import { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('bad_credentials')) setError('Invalid email or password.');
      else if (msg.includes('account_locked')) setError('Account locked. Please try again later.');
      else setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(193,60%,25%)] via-[hsl(200,50%,20%)] to-[hsl(215,30%,14%)] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white/20" style={{
              width: `${200 + i * 100}px`, height: `${200 + i * 100}px`,
              top: '50%', left: '50%', transform: 'translate(-50%, -50%)'
            }} />
          ))}
        </div>
        <div className="relative text-center text-white px-12">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8">
            <GraduationCap className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">EduSync</h2>
          <p className="text-lg text-white/70 max-w-sm">Streamline your school's academic and administrative workflow in one unified platform.</p>
        </div>
      </div>

      {/* Right panel - Login */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">EduSync</h1>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-1">Welcome back</h3>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your school portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@school.edu" required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required className="mt-1.5" />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
