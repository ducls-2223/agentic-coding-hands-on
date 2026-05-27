import Image from "next/image";

import { PrelaunchContent } from "./_components/prelaunch-content";

// Auth + prelaunch gate run in proxy.ts; this route is rendered without
// touching Supabase. Force dynamic so the page doesn't get statically cached
// across the event-start boundary.
export const dynamic = "force-dynamic";

export default function PrelaunchPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#00070C]">
      <Image
        src="/prelaunch/bg.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />
      <div className="relative z-10 flex w-full justify-center px-4">
        <PrelaunchContent />
      </div>
    </main>
  );
}
