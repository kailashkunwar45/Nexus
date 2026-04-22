import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {useState} from "react";
import axios from "axios";

export default function LoginPage() {
  const {data,status} = useSession();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (status === 'loading') {
    return '';
  }
  if (data) {
    router.push('/');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });
      if (result.error) {
        setError("Invalid email or password");
      } else {
        router.push('/');
      }
    } else {
      try {
        await axios.post('/api/register', {name, email, password});
        // Auto login after registration
        await signIn('credentials', {
          redirect: false,
          email,
          password
        });
        router.push('/');
      } catch (e) {
        setError(e.response?.data?.message || "Registration failed");
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-nexusDarkGray p-4">
      <div className="mb-8">
        <img src="/logo.png" alt="Nexus Logo" className="h-24 w-24 object-contain rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
      </div>
      <h1 className="text-3xl font-bold mb-8 text-white">Join Nexus Today</h1>
      
      <div className="bg-nexusBorder p-8 rounded-2xl shadow-xl w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-center mb-2">{isLogin ? 'Log In' : 'Create Account'}</h2>
          
          {!isLogin && (
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
              required
            />
          )}
          
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
            required
          />
          
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="bg-nexusDarkGray text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nexusAccent"
            required
          />
          
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <button type="submit" className="bg-nexusAccent hover:bg-opacity-80 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-nexusAccent/50 mt-2">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
        
        <div className="text-center mt-6 text-nexusLightGray text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {setIsLogin(!isLogin); setError('');}} 
            className="text-nexusAccent hover:underline font-semibold"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}