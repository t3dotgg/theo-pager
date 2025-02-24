import PageTheoForm from "@/components/page-theo-form";
import { getUserFromToken, setUserToken } from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";
import { z } from "zod";
import { authSchema } from "@/shared/validate-form";

async function authFunction(formdata: z.infer<typeof authSchema>) {
  "use server";

  const { username, passphrase } = authSchema.parse(formdata);

  if (passphrase !== process.env.PASSPHRASE) {
    throw new Error("you aren't supposed to be here");
  }

  // User is authenticated, we can create and store a cookie now
  const token = crypto.randomUUID();

  await setUserToken(token, username);

  const cookieStore = await cookies();
  cookieStore.set("page-theo-token", token);
  revalidatePath("/fake-path");
}

async function HomeContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("page-theo-token")?.value;

  if (!token) return <AuthForm action={authFunction} />;

  const dataFromKv = await getUserFromToken(token);
  if (!dataFromKv || !dataFromKv.username) {
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
