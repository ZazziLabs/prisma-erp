
import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { LogIn, Mail, Sparkles, TrendingUp, Lock } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';

const chartData = [
  { name: 'S1', value: 40 },
  { name: 'S2', value: 65 },
  { name: 'S3', value: 45 },
  { name: 'S4', value: 90 },
  { name: 'S5', value: 55 },
  { name: 'S6', value: 80 },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigate('/new-sale');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/new-sale');
    } catch (err: any) {
      setError("Credenciais inválidas. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    alert("Solicitação inválida. Servidor apresentando instabilidade.");
    /* const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Erro no login com Google:", error);
      setError("Não foi possível fazer login com o Google.");
    } */
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] font-body text-white selection:bg-[#820ad1]/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        
        {/* --- Lado Esquerdo: Formulário --- */}
        <div className="flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
          <div className="w-full max-w-[420px] mx-auto">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-20">
                <div className="w-10 h-10 bg-[#820ad1] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(130,10,209,0.3)]">
                    <Sparkles size={22} className="text-white" />
                </div>
                <span className="font-headline text-2xl font-bold tracking-tight">Prisma</span>
            </div>

            {/* Headline Estilo Claude */}
            <h1 className="font-headline text-5xl sm:text-6xl font-medium tracking-tight mb-6 leading-[1.1] text-center">
              Impossível?
              <br />
              <span className="text-white/100">Possível.</span>
            </h1>
            <p className="text-lg text-white/40 mb-12 max-w-[320px] leading-relaxed mx-auto text-center">
              A inteligência que simplifica sua gestão financeira.
            </p>

            {/* Caixa de Autenticação */}
            <div className="bg-[#0f0f0f] border border-white/5 p-8 rounded-[32px] shadow-2xl">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center gap-3 bg-transparent border border-white/10 py-3.5 rounded-2xl hover:bg-white/5 transition-all duration-200 font-medium text-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
                Continuar com Google
              </button>

              <div className="my-8 flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5"></div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">ou</span>
                <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl focus:ring-1 focus:ring-[#820ad1] focus:border-[#820ad1] outline-none transition-all placeholder:text-white/20 text-sm"
                      placeholder="Digite seu e-mail"
                      required
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 bg-white/[0.02] border border-white/10 rounded-2xl focus:ring-1 focus:ring-[#820ad1] focus:border-[#820ad1] outline-none transition-all placeholder:text-white/20 text-sm"
                      placeholder="Sua senha"
                      required
                    />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#820ad1] text-white font-bold py-4 rounded-2xl hover:bg-[#9625e6] active:scale-[0.98] transition-all text-sm shadow-[0_10px_20px_rgba(130,10,209,0.2)] disabled:opacity-50 mt-4"
                >
                  {loading ? 'Acessando...' : 'Acessar Prisma'}
                </button>
              </form>

              {error && <p className="text-xs text-red-400 mt-4 text-center bg-red-400/10 py-2 rounded-lg">{error}</p>}

              <p className="text-[10px] text-white/20 mt-10 text-center leading-relaxed">
                Ao entrar, você concorda com nossos <span className="text-white/40 underline cursor-pointer">Termos</span> e <span className="text-white/40 underline cursor-pointer">Privacidade</span>.
              </p>
            </div>
          </div>
        </div>

        {/* --- Lado Direito: Visual (Imagem + Card Flutuante) --- */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 relative">
            <div className="w-full max-w-2xl aspect-[4/5] rounded-[48px] overflow-hidden relative group shadow-2xl">
                <img 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80" 
                    alt="Success" 
                />
                
                {/* Overlay Gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Card de Performance Flutuante */}
                <div className="absolute bottom-10 left-10 right-10 bg-black/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] shadow-2xl transform transition-all duration-500 hover:-translate-y-2">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-2">Fluxo de Caixa</p>
                            <h3 className="text-3xl font-bold font-headline text-white tracking-tight">+R$ 42.500</h3>
                        </div>
                        <div className="w-12 h-12 bg-[#820ad1]/20 rounded-2xl flex items-center justify-center border border-[#820ad1]/30">
                            <TrendingUp size={24} className="text-[#820ad1]" />
                        </div>
                    </div>
                    
                    {/* Container do Gráfico com dimensões fixas para evitar erro */}
                    <div className="h-[140px] w-full min-w-0">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                                        {chartData.map((entry, index) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={index === 3 ? '#820ad1' : 'rgba(255,255,255,0.08)'} 
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
