import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarProvider, 
  SidebarTrigger,
  useSidebar 
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { Send, ArrowLeft, Plus, Trash2, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  name: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

const ChatSidebar = ({ 
  project, 
  chatSessions, 
  currentSession, 
  setCurrentSession, 
  createNewSession, 
  deleteSession,
  navigate 
}: {
  project: Project | null;
  chatSessions: ChatSession[];
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession) => void;
  createNewSession: () => void;
  deleteSession: (id: string) => void;
  navigate: (path: string) => void;
}) => {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="p-4 border-b">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/dashboard")}
              className="w-full justify-start mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h2 className="font-semibold truncate">{project?.name}</h2>
            <p className="text-sm text-muted-foreground truncate">{project?.description}</p>
          </div>
          
          <div className="p-4 border-b">
            <Button onClick={createNewSession} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          <SidebarGroupContent>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-2">
                    <Button
                      variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                      className="flex-1 justify-start text-left h-auto p-2"
                      onClick={() => setCurrentSession(session)}
                    >
                      <div className="truncate">
                        <div className="text-sm font-medium truncate">{session.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSession(session.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const Chat = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [user, setUser] = useState<User | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(10);

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
    if (user && projectId) {
      fetchProject();
      fetchChatSessions();
    }
  }, [user, projectId]);

  useEffect(() => {
    if (currentSession) {
      fetchMessages();
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch project",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatSessions(data || []);
      
      // If no sessions exist, create one
      if (!data || data.length === 0) {
        createNewSession();
      } else {
        setCurrentSession(data[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch chat sessions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!currentSession) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_session_id', currentSession.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const createNewSession = async () => {
    if (!user || !projectId) return;

    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: `Chat ${new Date().toLocaleString()}`
        })
        .select()
        .single();

      if (error) throw error;
      
      setChatSessions(prev => [data, ...prev]);
      setCurrentSession(data);
      setMessages([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive",
      });
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
      setChatSessions(updatedSessions);

      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSession(updatedSessions[0]);
        } else {
          createNewSession();
        }
      }

      toast({
        title: "Success",
        description: "Chat session deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession || !user || sending) return;

    // Rate limiting check
    const now = Date.now();
    const timeSinceLastMessage = now - lastMessageTime;
    const minInterval = 10000; // 30 seconds between messages

    if (timeSinceLastMessage < minInterval) {
      toast({
        title: "Rate Limited",
        description: `Please wait ${Math.ceil((minInterval - timeSinceLastMessage) / 1000)} seconds before sending another message`,
        variant: "destructive",
      });
      return;
    }

    if (rateLimitRemaining <= 0) {
      toast({
        title: "Rate Limited", 
        description: "You've reached the message limit. Please wait before sending more messages.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    const messageText = inputMessage.trim();
    setInputMessage("");
    setLastMessageTime(now);
    setRateLimitRemaining(prev => prev - 1);

    try {
      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const response = await supabase.functions.invoke('chat-completion', {
        body: {
          message: messageText,
          chatSessionId: currentSession.id,
          projectId: projectId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send message');
      }

      // Refresh messages to get the latest conversation
      await fetchMessages();

      // Reset rate limit counter after successful message
      setTimeout(() => {
        setRateLimitRemaining(prev => Math.min(prev + 1, 10));
      }, 60000); // Reset 1 message per minute

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen w-full bg-background">
        <ChatSidebar
          project={project}
          chatSessions={chatSessions}
          currentSession={currentSession}
          setCurrentSession={setCurrentSession}
          createNewSession={createNewSession}
          deleteSession={deleteSession}
          navigate={navigate}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {currentSession ? (
            <>
              <div className="border-b p-4 flex items-center justify-between">
                <SidebarTrigger />
                <h3 className="font-semibold truncate">{currentSession.name}</h3>
                <div></div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <Card className={`${isMobile ? 'max-w-[85%]' : 'max-w-[80%]'} ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card'
                    }`}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <Card className="bg-card">
                      <CardContent className="p-3">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending || rateLimitRemaining <= 0}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !inputMessage.trim() || rateLimitRemaining <= 0}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {rateLimitRemaining <= 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Messages remaining: {rateLimitRemaining}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <SidebarTrigger className="mb-4" />
                <p className="text-muted-foreground">Select a chat session to start</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;