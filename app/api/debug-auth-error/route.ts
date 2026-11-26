// Temporary diagnostic endpoint - DELETE AFTER FIXING
let lastError: { name: string; message: string; cause?: string } | null = null;

export function setLastError(err: Error) {
  lastError = {
    name: err.name,
    message: err.message,
    cause: JSON.stringify((err as unknown as Record<string, unknown>).cause ?? null),
  };
}

export async function GET() {
  return Response.json(lastError ?? { status: "no error recorded" });
}
