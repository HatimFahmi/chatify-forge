import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Chat completion request received');
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create supabase client with user auth
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { message, chatSessionId, projectId } = await req.json();

    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing message for user:', user.id);

    // Get project and system prompt
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('system_prompt')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError) {
      throw new Error('Project not found or access denied');
    }

    // Get chat history
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_session_id', chatSessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
    }

    // Save user message
    const { error: saveError } = await supabase
      .from('messages')
      .insert({
        chat_session_id: chatSessionId,
        user_id: user.id,
        role: 'user',
        content: message
      });

    if (saveError) {
      console.error('Error saving user message:', saveError);
    }

    // Prepare messages for OpenAI
    const openAIMessages = [];
    
    if (project.system_prompt) {
      openAIMessages.push({
        role: 'system',
        content: project.system_prompt
      });
    }

    // Add chat history
    if (messages && messages.length > 0) {
      openAIMessages.push(...messages);
    }

    // Add current user message
    openAIMessages.push({
      role: 'user',
      content: message
    });

    console.log('Sending request to OpenAI with', openAIMessages.length, 'messages');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openAIMessages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('Got response from OpenAI');

    // Save assistant message
    const { error: saveAssistantError } = await supabase
      .from('messages')
      .insert({
        chat_session_id: chatSessionId,
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage
      });

    if (saveAssistantError) {
      console.error('Error saving assistant message:', saveAssistantError);
    }

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      usage: data.usage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat-completion function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});