import Chat from "./chat";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "1.5rem 1rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Mythology Tutor</h1>
        <p style={{ margin: "0.25rem 0 0", color: "var(--muted)" }}>
          Ask about the Greek gods and their myths. Answers are grounded in a curated content pack.
        </p>
      </header>
      <Chat />
    </main>
  );
}
