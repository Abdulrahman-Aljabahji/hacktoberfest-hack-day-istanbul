export default function Close() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-accent text-bg font-body">
      <h1 className="absolute left-[6vw] top-[8vh] w-[50vw] font-display font-extrabold text-[11vw] leading-[0.92] tracking-tight">Cross the gap</h1>
      <p className="absolute left-[6vw] bottom-[8vh] bg-bg text-accent font-display font-extrabold text-[2.8vw] leading-none px-[2.4vw] py-[2.4vh]">Try it live: KÖPRÜ</p>
      <div className="absolute left-[60vw] right-[6vw] top-[8vh] bottom-[8vh] flex flex-col justify-between">
        <p className="border-t-[0.3vw] border-bg pt-[2.4vh] font-display font-extrabold text-[3vw] leading-tight">Best Use of Gemma 4</p>
        <p className="border-t-[0.3vw] border-bg pt-[2.4vh] font-display font-extrabold text-[3vw] leading-tight">Best Open-Source AI Project</p>
        <p className="border-t-[0.3vw] border-bg pt-[2.4vh] font-display font-extrabold text-[3vw] leading-tight">Best Design</p>
        <p className="border-t-[0.3vw] border-bg pt-[2.4vh] font-display font-extrabold text-[3vw] leading-tight">Best use of Replit</p>
      </div>
    </div>
  );
}
