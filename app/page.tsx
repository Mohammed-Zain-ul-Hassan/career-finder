import { AuthForm } from "@/components/auth-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex mb-12">
        <h1 className="text-4xl font-bold text-center w-full">
          Career Finder <span className="text-blue-600">AI</span>
        </h1>
      </div>

      <AuthForm />

      <div className="mt-12 text-center text-gray-500 text-xs">
        <p>Powered by Gemini 2.5 Flash Lite • Supabase • SerpAPI</p>
      </div>
    </main>
  );
}