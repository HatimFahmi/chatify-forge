# Chatify Forge

Chatify Forge is a full-stack platform for creating, managing, and deploying intelligent AI chatbots. Users can build custom AI agents, define their behavior with system prompts, enhance their knowledge base by uploading documents, and interact with them through a real-time chat interface.

The application is built using a modern web stack, featuring a React frontend and a Supabase backend, which handles authentication, database storage, and serverless functions.

## Key Features

-   **Project Management**: Create, view, update, and delete chatbot projects. Each project is isolated and has its own configuration.
-   **Customizable AI Agents**: Define a unique personality and set of instructions for each agent using a system prompt.
-   **Document Upload**: Upload files to provide your AI assistant with a specific knowledge base, enabling it to answer questions on proprietary data.
-   **Multi-Session Chat**: Engage in multiple, distinct chat sessions with each AI agent, with full conversation history saved.
-   **Secure Authentication**: User sign-up, login, and session management are handled securely by Supabase Auth.
-   **Responsive UI**: A clean, modern, and responsive user interface built with **shadcn/ui** and **Tailwind CSS**.
-   **Roadmap Page**: A "What's in the Works" page to showcase upcoming features and the project's future direction.

## Tech Stack

-   **Frontend**: Vite, React, TypeScript
-   **Backend**: Supabase (Postgres, Auth, Edge Functions)
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui
-   **AI**: OpenAI API (gpt-4o-mini)
-   **Routing**: React Router
-   **State Management**: React Hooks, TanStack Query

## Architecture

The application is architected with a clear separation between the frontend and a BaaS (Backend as a Service) provider.

-   **React Frontend** (`/src`):
    -   A single-page application built with Vite for a fast development experience.
    -   Pages (`/src/pages`) define the main views: Authentication, Dashboard, Chat, and Settings.
    -   Reusable UI components (`/src/components/ui`) are based on the shadcn/ui library.
    -   Supabase integration is managed in `/src/integrations/supabase`, providing a typed client for database interactions.

-   **Supabase Backend** (`/supabase`):
    -   **Database**: A Postgres database stores user data, projects, chat sessions, and messages. Row Level Security (RLS) policies are enabled on all tables to ensure users can only access their own data. The schema is defined in `/supabase/migrations`.
    -   **Authentication**: Manages user accounts and secures API access.
    -   **Edge Functions**: Deno-based serverless functions handle secure backend logic.
        -   `chat-completion`: Orchestrates calls to the OpenAI API. It retrieves chat history and system prompts, constructs the payload, and saves both the user's and the assistant's messages to the database.
        -   `upload-file`: Securely handles file uploads by proxying them to the OpenAI Files API, ensuring API keys are not exposed on the client.

For a deeper dive, see [docs/architecture.md](docs/architecture.md).

## Getting Started

### Prerequisites

-   Node.js and npm
-   A Supabase account
-   An OpenAI API key

### Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/HatimFahmi/chatify-forge.git
    cd chatify-forge
    ```

2.  **Set up Supabase**
    -   Go to [Supabase](https://supabase.com/) and create a new project.
    -   Navigate to the **SQL Editor** in your Supabase project dashboard.
    -   Copy the contents of `supabase/migrations/20250921114831_052c63ae-51f3-4090-826b-d000c1e01e61.sql` and run it to create the necessary tables and policies.
    -   Navigate to **Project Settings > API** and find your Project URL and `anon` public key.
    -   Update the placeholder values in `src/integrations/supabase/client.ts` with your Supabase URL and anon key.
    -   Navigate to **Edge Functions** and create the `chat-completion` and `upload-file` functions. Set up the following secrets for both functions under **Project Settings > Edge Functions**:
        -   `OPENAI_API_KEY`: Your OpenAI API key.
        -   `SUPABASE_URL`: Your project's Supabase URL.
        -   `SUPABASE_SERVICE_ROLE_KEY`: Your project's `service_role` key (found in **Project Settings > API**).

3.  **Install Dependencies**

    ```bash
    npm install
    ```

4.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:8080`.

## Usage

1.  **Sign Up / Sign In**: Create an account or log in. You will receive an OTP for email verification.
2.  **Dashboard**: After logging in, you'll land on the dashboard where you can see all your projects.
3.  **Create a Project**: Click "New Project", provide a name, description, and an optional system prompt to guide your AI's behavior.
4.  **Project Settings**: Navigate to a project's settings to update its details, upload knowledge files, or delete the project.
5.  **Chat**: Open a project's chat interface to start a conversation with your AI agent. You can create new chat sessions to keep conversations organized.
