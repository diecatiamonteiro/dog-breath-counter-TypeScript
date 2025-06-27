import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Uh-oh... 
        </h2>
        <h2 className="text-2xl font-bold text-foreground mb-4">
    Something's Offbeat!
        </h2>
        <p className="text-foreground/70 mb-8">
          This page could not be found. But don't worry, your pup's data is
          still in rhythm.
        </p>
        <Link
          href="/"
          className="bg-primary text-navbar-items-bg px-6 py-3 shadow-md rounded-lg font-medium hover:bg-primary/80 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
