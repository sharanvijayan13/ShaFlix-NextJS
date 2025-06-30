import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-center">
        Shaflix
      </h1>
      
      <p className="text-lg mb-6 text-gray-700">
        Let's explore Next.js with shadcn and Tailwind!
      </p>

      <Button variant="default">
        Get Started
      </Button>
    </div>
  );
}
