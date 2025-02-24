import PageTheoForm from "@/components/page-theo-form";
import redisClient from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";

async function HomeContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("page-theo-token")?.value;

  if (!token)
    return (
      <AuthForm
        action={async (formdata) => {
          "use server";

          const username = formdata.username;
          const passphrase = formdata.passphrase;

          if (typeof username !== "string" || typeof passphrase !== "string") {
            throw new Error("malformed");
          }

          if (passphrase !== process.env.PASSPHRASE) {
            throw new Error("you aren't supposed to be here");
          }

          // User is authenticated, we can create and store a cookie now
          const token = crypto.randomUUID();

          const jsonified = JSON.stringify({
            username,
          });

          await redisClient.set(`token:${token}`, jsonified);

          const cookieStore = await cookies();
          cookieStore.set("page-theo-token", token);
          revalidatePath("/fake-path");
        }}
      />
    );

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
