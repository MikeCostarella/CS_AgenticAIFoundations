import { useId, useState, type FormEvent } from "react";
import { normalizeFolder, saveCourseFolder, useCourseFolder } from "../lib/courseFolder";

/**
 * "Your course folder" panel at the top of each scripted lab. Once a path is
 * saved, the VS Code labels in the steps become links that open the lab folder.
 */
export default function CourseFolderBox({ isLab1 }: { isLab1: boolean }) {
  const saved = useCourseFolder();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();
  const errId = useId();

  const startEdit = () => {
    setValue(saved ?? "");
    setError(null);
    setEditing(true);
  };

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    const clean = normalizeFolder(value);
    if (!clean) {
      setError("That doesn't look like a full path. It should start with a drive letter, like C:\\Users\\you\\agentic-ai.");
      return;
    }
    if (!saveCourseFolder(clean)) {
      setError("This browser is blocking saved site data (a private window, perhaps), so the path can't be remembered here.");
      return;
    }
    setEditing(false);
    setError(null);
  };

  if (saved && !editing) {
    return (
      <div className="course-folder is-set" id="course-folder">
        <span className="cf-label">Your course folder</span>
        <code className="cf-path">{saved}</code>
        <span className="cf-actions">
          <button type="button" className="cf-link" onClick={startEdit}>Change</button>
          <button type="button" className="cf-link" onClick={() => saveCourseFolder(null)}>Forget</button>
        </span>
        <p className="cf-hint">
          <b>VS Code</b> labels in the steps below open this lab's folder. In VS Code, press{" "}
          <kbd>Ctrl</kbd>+<kbd>`</kbd> to get PowerShell already in that folder.
        </p>
      </div>
    );
  }

  return (
    <form className="course-folder" id="course-folder" onSubmit={onSave}>
      <label className="cf-label" htmlFor={inputId}>Your course folder</label>
      <p className="cf-hint">
        {isLab1
          ? "After step 1 of the first task below, PowerShell prints your course folder's full path. Paste it here once and the VS Code labels in every lab become links that open the right folder."
          : "Paste the course-folder path PowerShell printed in Lab 1 (for example C:\\Users\\you\\agentic-ai), and the VS Code labels below become links that open this lab's folder."}
      </p>
      <div className="cf-row">
        <input
          id={inputId}
          type="text"
          spellCheck={false}
          autoComplete="off"
          placeholder="C:\Users\you\agentic-ai"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
        />
        <button type="submit" className="cf-save">Save</button>
        {saved && (
          <button type="button" className="cf-link" onClick={() => setEditing(false)}>Cancel</button>
        )}
      </div>
      {error && <p className="cf-error" id={errId} role="alert">{error}</p>}
      <p className="cf-note">Remembered in this browser only — it never leaves your computer.</p>
    </form>
  );
}
