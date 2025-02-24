import PageTheoForm from "@/components/page-theo-form";
import { getUserFromToken, setUserToken } from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";
import { authSchema } from "@/shared/validate-form";
import { submitNewModelAction } from "@/server/actions/submit-new-model";

async function authTokenCheck() {
  const cookieStore = await cookies();
  const token = cookieStore.get("page-theo-token")?.value;

  if (!token) {
    throw new Error("you aren't supposed to be here");
  }

  const dataFromKv = await getUserFromToken(token);
  if (!dataFromKv || !dataFromKv.username)
    throw new Error("you aren't supposed to be here");

  return dataFromKv;
}

async function HomeContent() {
  try {
    await authTokenCheck();
    return (
      <>
        <h1 className="mb-8 text-4xl font-bold">Page Theo</h1>
        <PageTheoForm
          action={async (formdata) => {
            "use server";
            const userData = await authTokenCheck();
            await submitNewModelAction(formdata, userData.username);
          }}
        />
      </>
    );
  } catch (error) {
    console.error(error);
    return (
      <AuthForm
        action={async (formdata) => {
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
        }}
      />
    );
  }
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
