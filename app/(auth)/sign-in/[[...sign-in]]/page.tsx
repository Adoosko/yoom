import { SignIn, SignedIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex h-screen w-full items-center justify-center">
      <SignIn></SignIn>
    </main>
  );
}
