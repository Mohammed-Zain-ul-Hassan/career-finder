# Carrier Finder 

**Your AI-Powered Career Copilot.**

Carrier Finder is an intelligent job search and interview preparation platform that leverages advanced AI agents to help you land your dream job. It goes beyond simple keyword matching by using OSINT strategies to find hidden job listings and Generative AI to prepare you for interviews with "insider" knowledge.

## ✨ Key Features

### 🔍 AI-Powered Job Discovery
-   **Multi-Source Search**: Scours Google Jobs, LinkedIn, and direct ATS portals (Greenhouse, Lever, Ashby) to find opportunities others miss.
-   **OSINT Strategies**: Uses advanced search operators to uncover "hidden" job postings and hiring manager posts.
-   **Smart Filtering**: Filter by Salary, Date Posted, Job Type, and Remote preference.

### 🧠 Intelligent Matching
-   **Resume Analysis**: Automatically extracts skills and experience from your PDF resume.
-   **Fit Scoring**: Uses **Gemini 2.5 Flash Lite** to analyze how well your profile matches a specific job description.
-   **Gap Analysis**: Identifies missing skills and provides actionable advice to bridge the gap.

### 📚 Deep Interview Prep
-   **Custom Study Guides**: Generates tailored interview prep materials for every job.
-   **Deep Web Research**: real-time research on **Glassdoor**, **Reddit**, **TeamBlind**, and **News** sources to find actual interview questions and company culture insights.
-   **No Placeholders**: Delivers concrete, actionable advice and simulated scenarios based on real-world data.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS & Shadcn UI
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
-   **AI Model**: Google Gemini 2.5 Flash Lite
-   **Search Engine**: [SerpAPI](https://serpapi.com/) (Google Search API)

## Getting Started

### Prerequisites
-   Node.js 18+
-   npm or pnpm
-   Supabase Account
-   Google Cloud Account (for Gemini API)
-   SerpAPI Account

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Mohammed-Zain-ul-Hassan/career-finder.git
    cd career-finder
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add the following:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    SERPAPI_KEY=your_serpapi_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
