const base = import.meta.env.BASE_URL;

export default function Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <img src={`${base}cover-bridge.jpg`} crossOrigin="anonymous" className="absolute inset-0 w-full h-full object-cover" alt="A saffron bridge carrying a crumpled notice across a gap to a clear checklist" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
      <div className="absolute left-[6vw] top-[8vh] bottom-[8vh] w-[52vw] flex flex-col justify-center">
        <h1 className="font-display font-extrabold text-[13vw] leading-[0.9] tracking-tight text-text">KÖPRÜ</h1>
        <p className="mt-[4vh] font-display font-extrabold text-[3.6vw] leading-tight text-accent">Point. Understand. Act.</p>
        <p className="mt-[6vh] text-[2vw] leading-snug text-text/80">Hacktoberfest Hack Day Istanbul x Hadith Tech 2026</p>
      </div>
    </div>
  );
}
