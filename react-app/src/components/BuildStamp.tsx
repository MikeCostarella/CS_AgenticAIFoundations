// Deployment honesty: the build embeds its own timestamp via a
// Vite define, so "which build are you on?" answers itself. Displayed in
// Eastern time with AM/PM; hover shows the raw UTC ISO stamp. timeZoneName
// renders EDT or EST automatically depending on the build date.
//
// Dev-server caveat: the define is evaluated when the Vite config loads, and
// HMR never re-evaluates it — so under `npm run dev` the stamp is the moment
// the dev server STARTED, not the latest edit. Label it honestly in dev so
// it can't be mistaken for a build time. (Restarting the dev server, or any
// real build, refreshes it.)
export default function BuildStamp() {
  const t = new Date(__BUILD_TIME__);
  const stamp = t.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
  return (
    <div className="build-stamp" title={__BUILD_TIME__}>
      {import.meta.env.DEV ? "Dev · up since" : "Build:"} {stamp}
    </div>
  );
}
