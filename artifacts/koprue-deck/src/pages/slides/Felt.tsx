const base = import.meta.env.BASE_URL;

export default function Felt() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <img src={`${base}shot-bridge.jpg`} crossOrigin="anonymous" className="absolute left-0 top-0 w-full h-[40vh] object-cover" alt="The 3D bridge scene from the KÖPRÜ hero" />
      <div className="absolute left-0 top-[40vh] w-full h-[1vh] bg-accent" />
      <h1 className="absolute left-[6vw] top-[49vh] w-[34vw] font-display font-extrabold text-[5.2vw] leading-[1] tracking-tight">Designed to be felt</h1>
      <div className="absolute left-[46vw] right-[6vw] top-[48vh] bottom-[8vh] flex flex-col justify-between">
        <p className="text-[2vw] font-bold leading-snug">A bridge you cross: notice on one bank, action on the other</p>
        <p className="text-[2vw] font-bold leading-snug">3D tilting scene and animated result cards</p>
        <p className="text-[2vw] font-bold leading-snug">Arabic right-to-left layout, Turkish quotes kept as-is</p>
        <p className="text-[2vw] font-bold leading-snug">Phone camera capture, reduced-motion support</p>
      </div>
    </div>
  );
}
