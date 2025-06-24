"use client";

import Link from "next/link";

export default function DogProfilePage() {
  return (
    <div>
      <h1>Dog Profile Page</h1>
      <p>Here you can see a dog profile</p>
      <Link href={`/my-dogs/id/monitor-breathing`} className="bg-primary">
        Monitor Breathing Now
      </Link>
    </div>
  );
}
