import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, BookOpen, Sparkles, GraduationCap, User } from "lucide-react";
import { useApp } from "./store";
import { authService } from "./services";
import { toast } from "sonner";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doLogin = async (e?: string, p?: string) => {
    setLoading(true);
    setError("");
    try {
      const user = await authService.login(e ?? email, p ?? password);
      login(user);
      toast.success(`Mirë se erdhe, ${user.name}!`);
      navigate(user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (ev: React.FormEvent) => { ev.preventDefault(); doLogin(); };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left */}
      <div className="hidden lg:flex flex-col bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[#5B52C7] pointer-events-none" />
        <div className="relative z-10 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="font-bold text-xl">LexoLehtë AI</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <Sparkles size={40} className="text-white/60 mb-6" />
            <h1 className="text-4xl font-bold leading-tight mb-4">
              Çdo tekst, në nivelin<br />e duhur për çdo nxënës.
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Adaptoni materialet mësimore me AI dhe mbështetini nxënësit që kanë vështirësi me leximin.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: BookOpen, text: "Thjeshtëson çdo material automatikisht" },
                { icon: GraduationCap, text: "Krijon kuize dhe fjalor të personalizuar" },
                { icon: Sparkles, text: "Gjurmon progresin e çdo nxënësi" },
              ].map(item => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm text-primary-foreground/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">A</div>
                <div>
                  <p className="text-sm font-semibold">Arta Osmani</p>
                  <p className="text-xs text-primary-foreground/70">Mësuese e Biologjisë</p>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/80 italic">
                "LexoLehtë AI kurseni orë pune dhe nxënësit e mi tani lexojnë me shumë kënaqësi."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold">LexoLehtë AI</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Hyr në llogari</h2>
          <p className="text-muted-foreground text-sm mb-7">Përdor llogarinë tënde ose provo me llogari demonstruese.</p>

          {/* Demo buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            <button onClick={() => doLogin("mesuesi@lexolehte.com", "demo123")} disabled={loading}
              className="flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-sm font-medium text-primary">
              <GraduationCap size={20} />
              Provo si Mësuese
            </button>
            <button onClick={() => doLogin("nxenesi@lexolehte.com", "demo123")} disabled={loading}
              className="flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 border-success/25 bg-success-muted hover:bg-success-muted/80 hover:border-success/40 transition-all text-sm font-medium text-success-muted-foreground">
              <User size={20} />
              Provo si Nxënës
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ose</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="emri@shembull.com" required autoComplete="email"
                className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Fjalëkalimi</label>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="w-full bg-input-background border border-border rounded-xl px-4 py-2.5 pr-11 text-sm outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPw ? "Fshih fjalëkalimin" : "Shfaq fjalëkalimin"}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-muted-foreground">Mbaj mend</span>
              </label>
              <button type="button" className="text-sm text-primary hover:underline">Harrove fjalëkalimin?</button>
            </div>

            {error && (
              <div role="alert" className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Duke hyrë...</>
              ) : "Hyr"}
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-muted rounded-xl text-xs text-muted-foreground space-y-0.5">
            <p><span className="font-medium">Mësuese:</span> mesuesi@lexolehte.com · demo123</p>
            <p><span className="font-medium">Nxënës:</span> nxenesi@lexolehte.com · demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
