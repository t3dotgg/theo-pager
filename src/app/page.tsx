import PageTheoForm from "@/components/page-theo-form";
import redisClient from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";

async function AuthForm() {
  const cookieStore = await cookies();
  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">Page Theo</h1>
      <p>Theo built this so he can be paged when a new model drops.</p>
      <form
        action={async (formdata) => {
          "use server";

          const username = formdata.get("username");
          const password = formdata.get("password");

          if (typeof username !== "string" || typeof password !== "string") {
            throw new Error("malformed");
          }

          if (password !== process.env.PASSPHRASE) {
            throw new Error("you aren't supposed to be here");
          }

          // User is authenticated, we can create and store a cookie now
          const token = crypto.randomUUID();

          const jsonified = JSON.stringify({
            username,
          });

          await redisClient.set(`token:${token}`, jsonified);

          cookieStore.set("page-theo-token", token);
          revalidatePath("/fake-path");
        }}
      >
        <input type="text" name="username" />
        <input type="password" name="password" />
        <button type="submit">Authenticate</button>
      </form>
    </>
  );
}

async function HomeContent() {
  const cookieStore = await cookies();

  const token = cookieStore.get("page-theo-token")?.value;

  if (!token) return <AuthForm />;

  const dataFromKv = await redisClient.get(`token:${token}`);
  if (!dataFromKv) {
    return <p>Invalid token</p>;
  }

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">Page Theo</h1>
      <PageTheoForm />
    </>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
