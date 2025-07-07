import { Suspense } from "react";
import HomeContent from "./components/HomeContent";

export default function Home() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
