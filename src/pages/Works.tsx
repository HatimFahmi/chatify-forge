import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Zap, Globe, Shield, Cpu, Database } from "lucide-react";

const Works = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track user interactions, message volume, and chatbot performance with detailed analytics and insights.",
      status: "Coming Soon",
      category: "Analytics"
    },
    {
      icon: Zap,
      title: "API Integrations",
      description: "Connect your chatbots to external services, CRM systems, and third-party APIs for enhanced functionality.",
      status: "In Development",
      category: "Integrations"
    },
    {
      icon: Globe,
      title: "Multi-language Support",
      description: "Deploy chatbots that can communicate in multiple languages with automatic translation capabilities.",
      status: "Planned",
      category: "Features"
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Enterprise-grade security features including data encryption, access controls, and compliance tools.",
      status: "Coming Soon",
      category: "Security"
    },
    {
      icon: Cpu,
      title: "Custom AI Models",
      description: "Train and deploy custom AI models tailored to your specific use cases and domain knowledge.",
      status: "Research",
      category: "AI/ML"
    },
    {
      icon: Database,
      title: "Data Export & Backup",
      description: "Export conversation data, create automated backups, and maintain full control over your data.",
      status: "Planned",
      category: "Data Management"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development":
        return "bg-yellow-500";
      case "Coming Soon":
        return "bg-blue-500";
      case "Planned":
        return "bg-purple-500";
      case "Research":
        return "bg-orange-500";
      default:
        return "bg-muted-foreground";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Analytics":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Integrations":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Features":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Security":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "AI/ML":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Data Management":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">What's in the Works</h1>
            <p className="text-muted-foreground mt-2">
              Exciting features and improvements coming to the ChatBot Platform
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20">
            <h2 className="text-xl font-semibold mb-2">🚀 Our Roadmap</h2>
            <p className="text-muted-foreground">
              We're constantly working to improve the ChatBot Platform with new features, 
              integrations, and capabilities. Here's what we're currently working on and 
              what's planned for the future.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getCategoryColor(feature.category)}`}
                      >
                        {feature.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(feature.status)} text-white border-0`}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Have a Feature Request?</CardTitle>
              <CardDescription>
                We'd love to hear your ideas and suggestions for improving the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="mr-2">
                Submit Feedback
              </Button>
              <Button>
                Join Community
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Works;