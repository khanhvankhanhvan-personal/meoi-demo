import type { Crisis } from "../types";

/** Sticky banner for Tier 3 replies. It never hides itself: only the mother can dismiss it. */
export function CrisisBanner({ crisis, onDismiss }: { crisis: Crisis; onDismiss: () => void }) {
  return (
    <div role="alert" className={`crisis crisis-${crisis.kind.toLowerCase()}`}>
      <button className="crisis-x" aria-label="Ẩn thông báo" onClick={onDismiss}>
        ×
      </button>
      <div className="crisis-label">{crisis.label}</div>
      <p className="crisis-body">{crisis.body}</p>
      <div className="crisis-actions">
        {crisis.contacts.map((c) => (
          <a key={c.phone} className="crisis-call" href={`tel:${c.phone}`}>
            {c.name}
          </a>
        ))}
      </div>
    </div>
  );
}
