interface DeckCardProps {
  id: number;
  name: string;
  total: number;
  due: number;
  tags?: string[];
  onReview: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function DeckCard({
  id,
  name,
  total,
  due,
  tags,
  onReview,
  onDelete,
}: DeckCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--hairline)",
        borderRadius: 6,
        padding: 24,
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--ink)",
            marginBottom: 4,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 14, color: "var(--mute)" }}>
          {total} cards {due > 0 && `· ${due} due`}
        </div>
        {tags && tags.length > 0 && (
          <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  padding: "2px 8px",
                  background: "var(--surface-soft)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 9999,
                  color: "var(--mute)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <a
          href={`/import?deck=${id}`}
          style={{
            fontSize: 14,
            color: "var(--link-blue)",
            textDecoration: "none",
          }}
        >
          Import
        </a>
        <button
          onClick={() => onReview(id)}
          disabled={due === 0}
          style={{
            padding: "8px 16px",
            background: due > 0 ? "var(--primary)" : "var(--surface-soft)",
            color: due > 0 ? "var(--ink)" : "var(--ash)",
            border: "1px solid var(--hairline)",
            borderRadius: 6,
            cursor: due > 0 ? "pointer" : "not-allowed",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Review {due > 0 && `(${due})`}
        </button>
        <button
          onClick={() => onDelete(id)}
          style={{
            color: "var(--ash)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
