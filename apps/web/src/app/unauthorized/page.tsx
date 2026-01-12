import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-muted-foreground mt-2">
          You don&apos;t have permission to access this resource.
        </p>
        <Link
          className="mt-4 inline-block text-blue-500 hover:underline"
          href="/"
        >
          Go back to home
        </Link>
      </div>
    </div>
  );
}
