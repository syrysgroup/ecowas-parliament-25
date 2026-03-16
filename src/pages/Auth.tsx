import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ECOWAS_COUNTRIES = [
  "Benin", "Burkina Faso", "Cabo Verde", "Côte d'Ivoire", "The Gambia",
  "Ghana", "Guinea", "Guinea-Bissau", "Liberia", "Mali",
  "Niger", "Nigeria", "Senegal", "Sierra Leone", "Togo",
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/profile");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/profile");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!country) {
      toast({ title: "Country required", description: "Please select your country.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, country },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a verification link." });
    }
  };

  return (
    <Layout>
      <section className="relative py-24 md:py-32 bg-gradient-hero text-primary-foreground">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/announcement/15.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/60 to-primary/40" />
        <div className="container relative text-center">
          <h1 className="text-4xl md:text-5xl font-black">Join the Movement</h1>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Sign in or create an account to apply as a Youth Representative.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input id="signup-name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                    <SelectContent>
                      {ECOWAS_COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? "Creating account…" : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Auth;
