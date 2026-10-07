import { useEffect, useRef, useState } from "react";

/** Copies text, falling back to a hidden textarea where the async Clipboard API is unavailable. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

/** A lab command block with a Copy button in its corner. */
export default function CopyCode({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyText(text);
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1800);
  };

  const label = state === "copied" ? "Copied ✓" : state === "failed" ? "Select and copy" : "Copy";

  return (
    <div className="step-cmd-wrap">
      <pre className="step-cmd">
        <code>{text}</code>
      </pre>
      <button
        type="button"
        className={`copy-btn${state === "copied" ? " is-copied" : ""}`}
        onClick={onCopy}
        aria-label={state === "idle" ? "Copy these commands" : label}
      >
        {label}
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Copied to clipboard" : state === "failed" ? "Copy failed" : ""}
      </span>
    </div>
  );
}
