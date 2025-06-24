import Link from "next/link";

export default function MyDogsPage() {
  return (
    <div>
    <div className="flex flex-row gap-6">
      <h1>My Dogs Page</h1>
      <Link href="/my-dogs/add-dog">Add Dog</Link>
    </div>

    <div className="flex flex-col">
      <div className="flex flex-row gap-6">
        <h3>April</h3>
        <Link href="/my-dogs/id">See Profile</Link>
      </div>
      <div className="flex flex-row gap-6">
        <h3>Dipsy</h3>
        <Link href="/my-dogs/id">See Profile</Link>
      </div>
    </div>
  </div>
  );
} 