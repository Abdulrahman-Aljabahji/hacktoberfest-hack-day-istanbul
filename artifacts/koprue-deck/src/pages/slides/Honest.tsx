export default function Honest() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <h1 className="absolute left-[6vw] top-[8vh] w-[32vw] font-display font-extrabold text-[7vw] leading-[0.95] tracking-tight">Honest by <span className="text-accent">design</span></h1>
      <div className="absolute left-[44vw] right-[6vw] top-[8vh] bottom-[8vh] flex flex-col justify-between">
        <p className="border-t-[0.25vw] border-primary pt-[2.4vh] text-[2.5vw] font-bold leading-snug">Evidence quotes shown for every step and fact</p>
        <p className="border-t-[0.25vw] border-primary pt-[2.4vh] text-[2.5vw] font-bold leading-snug">Uncertainty notice always visible when the model is unsure</p>
        <p className="border-t-[0.25vw] border-primary pt-[2.4vh] text-[2.5vw] font-bold leading-snug">Offline sample clearly labelled fictional, no AI</p>
        <p className="border-t-[0.25vw] border-primary pt-[2.4vh] text-[2.5vw] font-bold leading-snug">Not legal, medical or government advice</p>
      </div>
    </div>
  );
}
