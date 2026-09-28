"use client";

import { useState } from "react";
import { AsyncButton } from "@/components/ui/async-button";
import Chat from "@/components/chat/chat";

type TestResult = "success" | "error";

export default function AIAssistantPage() {
  const [testResult, setTestResult] = useState<TestResult>("success");

  async function runTest() {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 1000);
    });

    if (testResult === "error") {
      throw new Error("Simulated failure");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="h-[80vh] max-h-[700px]">
          <Chat />
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Button Motion Test
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Test the complete async button lifecycle without making a real
              AI request.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTestResult("success")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                testResult === "success"
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Test success
            </button>

            <button
              type="button"
              onClick={() => setTestResult("error")}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                testResult === "error"
                  ? "border-slate-800 bg-slate-800 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              Test failure
            </button>
          </div>

          <div className="mt-5">
            <AsyncButton onAction={runTest}>
              {testResult === "success" ? "Test success" : "Test failure"}
            </AsyncButton>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Interaction transitions use a 200ms ease-out timing so the button feels
            responsive without appearing abrupt. Success and error states remain
            visible for 1.4 seconds before returning to idle, while the error shake
            uses a short 300ms animation. The component animates transform, opacity,
            and background color rather than layout properties. Reduced-motion
            preferences remove movement while preserving the state and color
            feedback.
          </p>
        </section>
      </div>
    </main>
  );
}