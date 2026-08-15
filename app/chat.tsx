"use client";

import { useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    setInput("");

    // The full current conversation (including this new turn) is what we send.
    const history: Message[] = [...messages, { role: "user", content: text }];
    // Add a placeholder assistant turn we will fill in as tokens stream.
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        // Endpoint errors (e.g. missing key) arrive as JSON { error }.
        let message = `Request failed (${res.status}).`;
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          /* keep default */
        }
        // Drop the empty assistant placeholder and surface the error.
        setMessages(history);
        setError(message);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      // Read the streamed reply and render it progressively.
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: acc }]);
        scrollToBottom();
      }
    } catch (err) {
      setMessages(history);
      setError(
        err instanceof Error
          ? `Could not reach the tutor: ${err.message}`
          : "Could not reach the tutor."
      );
    } finally {
      setBusy(false);
      scrollToBottom();
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--panel)",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          minHeight: 320,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "var(--muted)", margin: "auto", textAlign: "center" }}>
            Try: &ldquo;Who is Persephone?&rdquo; or &ldquo;Why are there seasons?&rdquo;
          </p>
        )}

        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} busy={busy && i === messages.length - 1} />
        ))}

        {error && (
          <div
            role="alert"
            style={{
              background: "var(--error-bg)",
              border: "1px solid var(--error-border)",
              color: "var(--error-text)",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem",
          borderTop: "1px solid var(--border)",
          background: "var(--panel-2)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the tutor a question…"
          disabled={busy}
          aria-label="Your question"
          style={{
            flex: 1,
            padding: "0.6rem 0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            background: "var(--bg)",
            color: "var(--text)",
            fontSize: "1rem",
          }}
        />
        <button
          type="submit"
          disabled={busy || input.trim() === ""}
          style={{
            padding: "0.6rem 1.1rem",
            borderRadius: 8,
            border: "none",
            background: busy ? "var(--border)" : "var(--accent)",
            color: busy ? "var(--muted)" : "#1a1200",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: busy ? "default" : "pointer",
          }}
        >
          {busy ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}

function Bubble({
  role,
  content,
  busy,
}: {
  role: "user" | "assistant";
  content: string;
  busy: boolean;
}) {
  const isUser = role === "user";
  return (
    <div
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "85%",
        background: isUser ? "var(--learner)" : "var(--panel-2)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "0.6rem 0.85rem",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div
        style={{
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--muted)",
          marginBottom: "0.25rem",
        }}
      >
        {isUser ? "You" : "Tutor"}
      </div>
      {content || (busy ? <span style={{ color: "var(--muted)" }}>thinking…</span> : "")}
    </div>
  );
}
