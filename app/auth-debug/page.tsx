export default async function AuthDebugPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Auth Error Debug</h1>
      <pre style={{ background: "#f0f0f0", padding: 16 }}>
        {JSON.stringify(params, null, 2)}
      </pre>
      <p style={{ marginTop: 20 }}>
        <a href="/login">← Back to login</a>
      </p>
    </div>
  );
}
