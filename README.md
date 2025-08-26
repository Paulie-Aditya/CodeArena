# CodeArena 🚀

A competitive programming platform built with Next.js 15, Supabase, and Judge0 API. Practice coding problems, compete with others, and track your progress.

## Features

- **🏆 Competitive Programming**: Solve curated problems with multiple difficulty levels
- **💻 Code Editor**: Monaco Editor with syntax highlighting for JavaScript, Python, Java, and C++
- **⚡ Real-time Execution**: Judge0 API integration for instant code execution
- **📊 Progress Tracking**: Detailed statistics and submission history
- **🏅 Leaderboard**: Global ranking system with sorting options
- **🎨 Modern UI**: Clean, responsive design with dark/light theme support
- **🔐 Authentication**: Google and GitHub OAuth integration

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Code Execution**: Judge0 API (RapidAPI)
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (free tier)
- A Judge0 API key (RapidAPI - free tier: 50 requests/day)
- A Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd codearena
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Judge0 API
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_judge0_api_key
```

### 3. Database Setup

#### Create Supabase Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  solved_count INTEGER DEFAULT 0,
  easy_solved INTEGER DEFAULT 0,
  medium_solved INTEGER DEFAULT 0,
  hard_solved INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create problems table
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  test_cases JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  problem_id INTEGER REFERENCES problems(id) NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  verdict TEXT NOT NULL,
  runtime INTEGER,
  memory INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view problems" ON problems
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own submissions" ON submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view profiles for leaderboard" ON profiles
  FOR SELECT USING (true);

-- Triggers for profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### Seed Initial Problems

Add some sample problems to get started:

````sql
INSERT INTO problems (title, slug, description, difficulty, tags, test_cases) VALUES
(
  'Two Sum',
  'two-sum',
  'Given an array of integers `nums` and an integer `target`, return *indices of the two numbers such that they add up to `target`*.\n\nYou may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.\n\nYou can return the answer in any order.\n\n**Example 1:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n```\n\n**Example 2:**\n```\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n```\n\n**Example 3:**\n```\nInput: nums = [3,3], target = 6\nOutput: [0,1]\n```\n\n**Constraints:**\n- `2 <= nums.length <= 104`\n- `-109 <= nums[i] <= 109`\n- `-109 <= target <= 109`\n- **Only one valid answer exists.**',
  'Easy',
  ARRAY['Array', 'Hash Table'],
  '[{"input": "[2,7,11,15]\n9", "output": "[0,1]"}, {"input": "[3,2,4]\n6", "output": "[1,2]"}, {"input": "[3,3]\n6", "output": "[0,1]"}]'
),
(
  'Palindrome Number',
  'palindrome-number',
  'Given an integer `x`, return `true` *if `x` is a palindrome, and `false` otherwise*.\n\n**Example 1:**\n```\nInput: x = 121\nOutput: true\nExplanation: 121 reads as 121 from left to right and from right to left.\n```\n\n**Example 2:**\n```\nInput: x = -121\nOutput: false\nExplanation: From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome.\n```\n\n**Example 3:**\n```\nInput: x = 10\nOutput: false\nExplanation: Reads 01 from right to left. Therefore it is not a palindrome.\n```\n\n**Constraints:**\n- `-231 <= x <= 231 - 1`',
  'Easy',
  ARRAY['Math'],
  '[{"input": "121", "output": "true"}, {"input": "-121", "output": "false"}, {"input": "10", "output": "false"}]'
);
````

### 4. Authentication Setup

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Providers
3. Enable Google and GitHub providers
4. Add your OAuth credentials (Client ID and Secret)

### 5. Judge0 API Setup

1. Sign up for RapidAPI: https://rapidapi.com/
2. Subscribe to Judge0 CE API: https://rapidapi.com/judge0-official/api/judge0-ce/
3. Copy your API key to the environment variables

### 6. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 7. Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
codearena/
├── app/                    # Next.js App Router
│   ├── (app)/             # Protected app routes
│   ├── (auth)/            # Authentication routes
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Key Features Implementation

### Code Editor

- Monaco Editor with language support
- Auto-save to localStorage
- Fullscreen toggle
- Code templates for each language

### Code Execution

- Judge0 API integration
- Real-time verdict checking
- Runtime and memory tracking
- Test case validation

### User Progress

- Solved problems tracking
- Difficulty-based statistics
- Submission history with filtering
- Global leaderboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Judge0
