import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Plus, MessageSquare, Settings, LogOut, Wrench, Upload, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Project {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!user || !projectName.trim()) return;

    setUploading(true);
    try {
      const { data: projectData, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectName,
          description: projectDescription,
          system_prompt: systemPrompt,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload files if any are selected
      if (selectedFiles && selectedFiles.length > 0) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("No session found");

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const formData = new FormData();
          formData.append('file', file);
          formData.append('purpose', 'assistants');

          try {
            const response = await supabase.functions.invoke('upload-file', {
              body: formData,
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });

            if (response.error) {
              console.error('Error uploading file:', response.error);
              toast({
                title: "Warning",
                description: `Failed to upload ${file.name}`,
                variant: "destructive",
              });
            }
          } catch (fileError) {
            console.error('Error uploading file:', fileError);
            toast({
              title: "Warning", 
              description: `Failed to upload ${file.name}`,
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: "Project created successfully",
      });

      setShowCreateDialog(false);
      setProjectName("");
      setProjectDescription("");
      setSystemPrompt("");
      setSelectedFiles(null);
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            {isMobile ? 'ChatBot' : 'ChatBot Platform'}
          </h1>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button variant="outline" size="sm" onClick={() => navigate('/works')}>
                <Wrench className="h-4 w-4 mr-2" />
                What's in Works
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {isMobile ? <Menu className="h-4 w-4" /> : user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isMobile && (
                  <>
                    <DropdownMenuItem onSelect={() => navigate('/works')}>
                      <Wrench className="h-4 w-4 mr-2" />
                      What's in Works
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'} mb-8`}>
          <div>
            <h2 className={`font-bold ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Your Projects</h2>
            <p className="text-muted-foreground">Create and manage your chatbot projects</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className={isMobile ? 'w-full' : ''}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? 'mx-4 max-w-sm' : ''}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Set up a new chatbot project with custom settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="My Chatbot"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="A helpful customer service bot"
                  />
                </div>
                <div>
                  <Label htmlFor="prompt">System Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant that..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="files">Upload Files (Optional)</Label>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    accept=".pdf,.doc,.docx,.txt,.csv"
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload documents to enhance your agent's knowledge
                  </p>
                </div>
                <Button 
                  onClick={createProject} 
                  className="w-full" 
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No projects yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Create your first chatbot project to get started
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className={isMobile ? 'w-full' : ''}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {projects.map((project) => (
              <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/chat/${project.id}`)}
                      className={isMobile ? 'w-full' : 'flex-1'}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/project/${project.id}/settings`)}
                      className={isMobile ? 'w-full' : ''}
                    >
                      <Settings className="h-4 w-4" />
                      {isMobile && <span className="ml-2">Settings</span>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;