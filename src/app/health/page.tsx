const HEALTH_CHECK_URL = "https://jsonplaceholder.typicode.com/todos/1";

type HealthCheckResult =
  | { status: "ok"; data: unknown }
  | { status: "error"; message: string };

async function checkExternalApi(): Promise<HealthCheckResult> {
  try {
    const response = await fetch(HEALTH_CHECK_URL, { cache: "no-store" });

    if (!response.ok) {
      return {
        status: "error",
        message: `Request failed with status ${response.status} ${response.statusText}`,
      };
    }

    const data: unknown = await response.json();
    return { status: "ok", data };
  } catch {
    return {
      status: "error",
      message: "Unable to reach the external API.",
    };
  }
}

export default async function HealthPage() {
  const result = await checkExternalApi();
  const checkedAt = new Date().toISOString();

  return (
    <div className="flex flex-1 flex-col items-center bg-background px-6 py-16">
      <div className="w-full max-w-xl">
        <h1 className="text-center text-3xl font-semibold tracking-tight text-foreground">
          Health
        </h1>
        <p className="mt-3 text-center text-base text-muted">
          Confirms the app is running and can reach an external API.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-surface p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-foreground">
              Application
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1 text-sm font-medium text-success">
              <span aria-hidden className="h-2 w-2 rounded-sm bg-success" />
              Running
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
            <span className="text-sm font-medium text-foreground">
              External API
            </span>
            {result.status === "ok" ? (
              <span className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1 text-sm font-medium text-success">
                <span aria-hidden className="h-2 w-2 rounded-sm bg-success" />
                Reachable
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg bg-error/10 px-3 py-1 text-sm font-medium text-error">
                <span aria-hidden className="h-2 w-2 rounded-sm bg-error" />
                Unreachable
              </span>
            )}
          </div>

          <p className="mt-4 text-xs text-muted">
            {HEALTH_CHECK_URL} &middot; checked {checkedAt}
          </p>

          <div className="mt-4">
            {result.status === "ok" ? (
              <pre className="overflow-x-auto rounded-lg border border-border bg-background p-4 text-left text-xs text-foreground">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <p className="rounded-lg border border-error/30 bg-error/10 p-4 text-left text-sm text-error">
                {result.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
