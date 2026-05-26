import Link from "next/link";

export default function SunKudosPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0A0E1B] px-6 text-center text-white">
      <h1 className="font-montserrat text-3xl font-bold md:text-5xl">
        Sun* Kudos
      </h1>
      <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">
        Coming soon. The Sun* Kudos recognition program lives here.
      </p>
      <Link
        href="/"
        className="font-montserrat mt-8 inline-flex items-center rounded-lg bg-[#FFEA9E] px-6 py-3 font-bold text-[#00101A] transition-colors hover:brightness-95"
      >
        ← Back to home
      </Link>
    </main>
  );
}
