export default function Responsible() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <h1 className="absolute left-[6vw] top-[8vh] font-display font-extrabold text-[7.4vw] leading-[1] tracking-tight">Responsible and <span className="text-accent">open</span></h1>
      <div className="absolute left-[6vw] right-[6vw] bottom-[9vh] grid grid-cols-4 gap-[2.4vw]">
        <div className="border-t-[0.3vw] border-primary pt-[2.4vh]">
          <p className="text-[2.2vw] font-bold leading-snug">Rate limiting protects the API key</p>
        </div>
        <div className="border-t-[0.3vw] border-primary pt-[2.4vh]">
          <p className="text-[2.2vw] font-bold leading-snug">Race-safe requests: the latest result always wins</p>
        </div>
        <div className="border-t-[0.3vw] border-primary pt-[2.4vh]">
          <p className="text-[2.2vw] font-bold leading-snug">Uploads go to the Gemini API, so no IDs or private documents</p>
        </div>
        <div className="border-t-[0.3vw] border-primary pt-[2.4vh]">
          <p className="text-[2.2vw] font-bold leading-snug">MIT-licensed, open source on GitHub</p>
        </div>
      </div>
    </div>
  );
}
