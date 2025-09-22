import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-background">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-xl font-semibold">ChatBot Platform</span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Build Intelligent{' '}
                <span className="text-primary">AI Agents</span>{' '}
                for Your Business
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Create, manage, and deploy powerful chatbots with advanced AI capabilities. 
                Upload documents, customize prompts, and engage with your users seamlessly.
              </p>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="px-8 py-6 text-lg font-semibold"
                  onClick={() => navigate("/auth")}
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-lg"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
              </div>
            </div>

            {/* Chat Preview */}
            <div className="relative">
              <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Sales Assistant</span>
                </div>
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-muted-foreground text-sm">How can I help you today?</p>
                  </div>
                  <div className="bg-primary rounded-lg p-3 text-primary-foreground ml-8">
                    <p className="text-sm">Tell me about your pricing</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-2">Agent Performance</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                    </div>
                    <span className="text-green-600 font-medium ml-3">+12.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-3">Smart AI Integration</h3>
              <p className="text-muted-foreground">
                Connect with OpenAI and other LLM services
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-3">Document Upload</h3>
              <p className="text-muted-foreground">
                Upload files to enhance your agent's knowledge base
              </p>
            </div>
            <div className="text-center p-6">
              <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Secure authentication and data handling
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Redirect authenticated users directly to dashboard
  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome back!</h1>
        <p className="mb-4 text-xl text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
