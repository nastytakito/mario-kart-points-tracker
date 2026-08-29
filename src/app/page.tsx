import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 py-16">
      <div className="flex items-center gap-3 text-sm font-semibold text-foreground-dim tracking-[0.3em] uppercase">
        <span className="w-2 h-2 rounded-full bg-brand-red" />
        <span className="w-2 h-2 rounded-full bg-brand-blue" />
        <span className="w-2 h-2 rounded-full bg-brand-yellow" />
        <span className="w-2 h-2 rounded-full bg-brand-green" />
        Local Tournament Tracker
      </div>

      <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight animate-pop-in">
        <span className="text-brand-red">Kart</span>{" "}
        <span className="text-brand-blue">Points</span>
      </h1>

      <p className="max-w-md text-foreground-dim text-lg">
        Run Mario Kart 64, 8 Deluxe, and World tournaments — teams, live
        standings, and a projector-ready results screen.
      </p>

      <Link href="/tournaments">
        <Button size="xl" variant="red">
          Start Racing 🏁
        </Button>
      </Link>
    </main>
  );
}
