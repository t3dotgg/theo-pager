import PageTheoForm from "@/components/page-theo-form";
import {
  KV__getAllSubmittedModels,
  KV__getUserFromToken,
  KV__setUserToken,
} from "@/server/db/redis";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";
import AuthForm from "@/components/auth-form";
import { authSchema } from "@/shared/validate-form";
import { submitNewModelAction } from "@/server/actions/submit-new-model";
import { formatDistanceToNow } from "date-fns";

async function authTokenCheck() {
  const cookieStore = await cookies();
  const token = cookieStore.get("page-theo-token")?.value;

  if (!token) {
    throw new Error("you aren't supposed to be here");
  }

  const dataFromKv = await KV__getUserFromToken(token);
  if (!dataFromKv || !dataFromKv.username)
    throw new Error("you aren't supposed to be here");

  return dataFromKv;
}

async function HomeContent() {
  try {
    await authTokenCheck();

    const models = await KV__getAllSubmittedModels();
    return (
      <>
        <h1 className="mb-8 text-4xl font-bold">Page Theo</h1>
        <PageTheoForm
          action={async (formdata) => {
            "use server";
            const userData = await authTokenCheck();
            await submitNewModelAction(formdata, userData.username);

            // Hack to revalidate without killing caches
            revalidatePath("/fake-path");
          }}
        />
        <div className="mt-8">
          <h2 className="text-2xl font-bold">Submitted Models</h2>
          <ul className="mt-4 space-y-2">
            {models.map((model) => (
              <li key={model.model} className="flex items-center gap-2">
                <span className="font-medium">{model.model}</span>
                <span className="text-sm text-gray-500">
                  submitted by {model.submitter}
                </span>
                {model.submittedAt && (
                  <span className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(model.submittedAt), {
                      addSuffix: true,
                    })}
                  </span>
                )}
                {model.resourceLink && (
                  <a
                    href={model.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View Resource
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
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

          await KV__setUserToken(token, username);

          const cookieStore = await cookies();
          cookieStore.set("page-theo-token", token);

          // Hack to revalidate without killing caches
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
