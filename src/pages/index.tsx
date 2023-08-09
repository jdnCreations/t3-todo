import { sign } from "crypto";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Todos from "~/component/Todos";
import { api } from "~/utils/api";

export default function Home() {
  const { data: sessionData } = useSession();

  return (
    <>
      <Head>
        <title>Todo App (classic)</title>
        <meta name="description" content="todo application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          {sessionData && (
            <div className="grid grid-cols-1 gap-4 md:gap-8">
              <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-4 text-white">
                <h3 className="text-xl font-bold">Todos</h3>
                <Todos />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            {sessionData && (
              <p className="text-xl text-white">
                Logged in as {sessionData.user?.email}{" "}
              </p>
            )}
            <button
              className="rounded-md bg-blue-700 px-6 py-2 text-white outline-none hover:bg-blue-800 focus:ring-4"
              onClick={sessionData ? () => void signOut() : () => void signIn()}
            >
              {sessionData ? "Sign Out" : "Sign in"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
