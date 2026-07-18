import React from "react";

// Lightweight markdown renderer for changelog text.
// Supports: ### / ## headings, **bold**, - or * bullets, > quotes, and plain paragraphs.
// No external dependency required.

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  // Split on **bold** segments while keeping the delimiters
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts
    .filter((p) => p.length > 0)
    .map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={`${keyPrefix}-b-${idx}`} className="text-text-primary font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={`${keyPrefix}-t-${idx}`}>{part}</React.Fragment>;
    });
}

export const MarkdownLite: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const lines = text.split("\n");

  return (
    <div className={className}>
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        const key = `md-${idx}`;

        if (!line) return null;

        if (line.startsWith("### ")) {
          return (
            <p key={key} className="text-xs font-semibold text-text-primary mt-3 mb-1 first:mt-0">
              {renderInline(line.slice(4), key)}
            </p>
          );
        }

        if (line.startsWith("## ")) {
          return (
            <p key={key} className="text-sm font-bold text-text-primary mt-3 mb-1 first:mt-0">
              {renderInline(line.slice(3), key)}
            </p>
          );
        }

        if (line.startsWith("> ")) {
          return (
            <p
              key={key}
              className="border-l-2 border-accent-indigo/60 pl-2.5 italic text-text-secondary/90"
            >
              {renderInline(line.slice(2), key)}
            </p>
          );
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <p
              key={key}
              className="pl-2.5 relative before:content-['•'] before:absolute before:left-0 before:text-accent-indigo"
            >
              {renderInline(line.slice(2), key)}
            </p>
          );
        }

        if (line === "---") {
          return <hr key={key} className="border-bg-surface my-2" />;
        }

        return <p key={key}>{renderInline(line, key)}</p>;
      })}
    </div>
  );
};
