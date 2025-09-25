import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="max-w-2xl">
      <div className="flex flex-col">
        <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3">
          Uh-oh... Something’s Offbeat!
        </h2>
        <p className="text-foreground/70 leading-tight">
          This page could not be found. But don’t worry, your pup’s data is
          still in rhythm.
        </p>
        <Button href="/" variant="primary" className="w-fit mt-8">
          Return to Home
        </Button>
      </div>
    </div>
  );
}
