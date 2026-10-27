# Daily Task Manager

A task management application built with React and Supabase where users can register, manage projects, organize tasks into columns and securely store their data in the cloud.

---

## Development

This project was developed using modern AI-assisted development tools, including:

- Claude Code
- Custom AI agents
- Supabase MCP

These tools were used to accelerate development, database integration and code generation, while the application architecture, testing, debugging and final implementation were directed and validated by the author.

---

## Features

- User registration and login
- Email confirmation
- Project management
- Create, edit and delete projects
- Create, edit and delete columns
- Create, edit and delete tasks
- Drag and drop task management
- Light, dark and multiple custom color themes
- Responsive design
- Secure user authentication
- Data persistence with PostgreSQL
- Row Level Security (RLS)

---

## Technologies

- React
- JavaScript (ES6+)
- Vite
- CSS3
- Supabase
- PostgreSQL Database
- Supabase Authentication
- Row Level Security (RLS)

---

## Installation

Clone the repository:

```bash
git clone https://github.com/gregoriomesafernandez-star/daily-task-manager-react.git
cd daily-task-manager-react
npm install
```

Create a `.env.local` file and configure your Supabase project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

---

## Database Setup

This project uses Supabase with PostgreSQL as its database.

To configure the database:

1. Create a new project in Supabase.
2. Open the SQL Editor in your Supabase dashboard.
3. Open the DATABASE_SETUP.md file in this repository.
4. Copy the complete SQL script from the file and paste it into the SQL Editor.
5. Execute the script to create the database tables, relationships, indexes, and Row Level Security (RLS) policies.

The script creates the following tables:

- projects — Stores user projects.
- columns — Stores the columns associated with each project.
- tasks — Stores tasks associated with each column.

It also configures foreign keys, indexes, and RLS policies to help ensure that authenticated users can only access and manage their own projects, columns, and tasks.

Important: Configure your Supabase environment variables in the .env.local file before running the application. See the Installation section for details.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

---

## Usage

Create a new account or sign in with an existing one to:

- Create projects
- Create custom columns
- Create, edit and delete tasks
- Move tasks between columns using drag and drop
- Organize your daily workflow
- Switch between light, dark and multiple custom color themes

Each authenticated user can only access their own projects and tasks thanks to Supabase Row Level Security (RLS).

---

## Author

Gregorio Mesa

---