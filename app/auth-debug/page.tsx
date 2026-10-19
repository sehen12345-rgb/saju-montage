export default function AuthDebugPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div style={{ padding: 40, fontFamily: "monospace" }}>
      <h1>Auth Error Debug</h1>
      <p>
        <strong>error:</strong> {searchParams.error ?? "(none)"}
      </p>
      <p style={{ marginTop: 20 }}>
        <a href="/login">← Back to login</a>
      </p>
    </div>
  );
}
