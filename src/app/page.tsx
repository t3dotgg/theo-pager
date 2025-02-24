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
import { tryCatch } from "@/shared/trycatch";
import { FaRobot, FaUser, FaClock, FaPlus } from "react-icons/fa";
import Image from "next/image";

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

async function ModelPage() {
  const models = await KV__getAllSubmittedModels();
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="text-center lg:text-left space-y-4">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative w-32 h-32 lg:w-24 lg:h-24 flex-shrink-0">
                <Image
                  src="https://pbs.twimg.com/profile_images/1799982162831396865/Fnol01I1_400x400.jpg"
                  alt="Theo's avatar"
                  fill
                  className="rounded-full object-cover shadow-lg ring-4 ring-purple-600/20"
                  priority
                />
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Page Theo
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Submit new model drops and Theo will be notified instantly
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl border shadow-lg p-8">
            <div className="flex items-center gap-2 mb-6">
              <FaPlus className="text-purple-600 text-xl" />
              <h2 className="text-2xl font-bold">Submit New Model</h2>
            </div>
            <PageTheoForm
              action={async (formdata) => {
                "use server";
                const userData = await authTokenCheck();
                await submitNewModelAction(formdata, userData.username);
                revalidatePath("/fake-path");
              }}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-lg p-8 h-fit">
          <div className="flex items-center gap-2 mb-8">
            <FaRobot className="text-blue-600 text-xl" />
            <h2 className="text-2xl font-bold">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {models.map((model) => (
              <div
                key={model.model}
                className="py-6 flex items-center justify-between gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-lg px-4 -mx-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate flex items-center gap-2">
                    <FaRobot className="text-blue-500" />
                    {model.model}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-gray-400" />
                      {model.submitter}
                    </span>
                    {model.submittedAt && (
                      <span className="flex items-center gap-1">
                        <FaClock className="text-gray-400" />
                        {formatDistanceToNow(new Date(model.submittedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {models.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <FaRobot className="mx-auto text-4xl mb-3 text-gray-400" />
                <p>No models submitted yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function HomeContent() {
  const { data, error } = await tryCatch(authTokenCheck());

  if (error || !data) {
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

  return <ModelPage />;
}

export default function Home() {
  return (
    <main className="min-h-screen w-full py-12 px-4 sm:px-6 md:py-16 lg:py-24">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">Loading...</div>
        }
      >
        <HomeContent />
        
      </Suspense>
    </main>
  );
}
