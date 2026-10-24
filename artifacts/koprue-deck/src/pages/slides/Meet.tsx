export default function Meet() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <h1 className="absolute left-[6vw] top-[8vh] font-display font-extrabold text-[8vw] leading-[1] tracking-tight">Meet <span className="text-accent">KÖPRÜ</span></h1>
      <div className="absolute left-[6vw] right-[6vw] bottom-[9vh] grid grid-cols-3 gap-[3vw]">
        <div className="border-t-[0.3vw] border-accent pt-[2.4vh]">
          <p className="font-display font-extrabold text-[9vw] leading-none text-primary">1</p>
          <p className="mt-[2vh] text-[2.5vw] font-bold leading-snug">Take a photo of a notice or paste its text</p>
        </div>
        <div className="border-t-[0.3vw] border-accent pt-[2.4vh]">
          <p className="font-display font-extrabold text-[9vw] leading-none text-primary">2</p>
          <p className="mt-[2vh] text-[2.5vw] font-bold leading-snug">Get a mini-interface in English, Arabic or Turkish</p>
        </div>
        <div className="border-t-[0.3vw] border-accent pt-[2.4vh]">
          <p className="font-display font-extrabold text-[9vw] leading-none text-primary">3</p>
          <p className="mt-[2vh] text-[2.5vw] font-bold leading-snug">Next steps, key facts, original quotes and a phrase to say aloud</p>
        </div>
      </div>
    </div>
  );
}
