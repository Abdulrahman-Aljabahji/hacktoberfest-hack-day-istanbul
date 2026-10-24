const base = import.meta.env.BASE_URL;

export default function NoticeToAction() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute left-[6vw] top-[8vh] w-[40vw]">
        <h1 className="font-display font-extrabold text-[5.4vw] leading-[1] tracking-tight">From notice to action</h1>
        <p className="mt-[5vh] border-t border-text/30 py-[1.8vh] text-[2.1vw] leading-snug">Photo or text goes in</p>
        <p className="border-t border-text/30 py-[1.8vh] text-[2.1vw] leading-snug">Checklist of steps and the facts that matter</p>
        <p className="border-t border-text/30 py-[1.8vh] text-[2.1vw] leading-snug">Each claim links to the verbatim original wording</p>
        <p className="border-t border-text/30 py-[1.8vh] text-[2.1vw] leading-snug">A say-it card with text-to-speech</p>
      </div>
      <img src={`${base}shot-result-top.jpg`} crossOrigin="anonymous" className="absolute left-[50vw] top-[8vh] h-[64vh] border-[0.25vw] border-accent shadow-2xl" alt="The KÖPRÜ result view showing a headline, caution and key facts" />
      <img src={`${base}shot-result-bottom.jpg`} crossOrigin="anonymous" className="absolute right-[6vw] bottom-[8vh] h-[62vh] border-[0.25vw] border-primary shadow-2xl" alt="The KÖPRÜ next steps and say-it card" />
    </div>
  );
}
