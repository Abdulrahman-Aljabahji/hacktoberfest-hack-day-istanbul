export default function Gemma() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-primary text-bg font-body">
      <h1 className="absolute left-[6vw] top-[8vh] bottom-[8vh] w-[48vw] flex flex-col justify-center font-display font-extrabold tracking-tight">
        <span className="text-[3.6vw] leading-none">Built on</span>
        <span className="mt-[1vh] text-[12.5vw] leading-[0.9]">Gemma 4</span>
      </h1>
      <div className="absolute left-[56vw] right-[6vw] top-[8vh] bottom-[8vh] flex flex-col justify-center">
        <p className="border-t-[0.25vw] border-bg py-[2.4vh] text-[2.2vw] font-bold leading-snug">Open-weight Gemma 4 26B A4B through the Gemini API</p>
        <p className="border-t-[0.25vw] border-bg py-[2.4vh] text-[2.2vw] font-bold leading-snug">Multimodal: reads photos and pasted text</p>
        <p className="border-t-[0.25vw] border-bg py-[2.4vh] text-[2.2vw] font-bold leading-snug">Structured JSON output, validated and length-capped on the server</p>
        <p className="border-t-[0.25vw] border-bg py-[2.4vh] text-[2.2vw] font-bold leading-snug">Tiny API key footprint: calls stay on the server</p>
      </div>
    </div>
  );
}
