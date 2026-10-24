import type { CSSProperties } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';

const PLANKS = 11;

export function BridgeScene() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), { stiffness: 80, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 80, damping: 14 });

  return (
    <div
      className="relative w-full select-none"
      style={{ perspective: 1100 }}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      aria-hidden="true"
      data-testid="scene-bridge"
    >
      <motion.div
        style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-0 py-6"
      >
        {/* Source bank: confusing paper */}
        <div
          className={`${reduce ? '' : 'sway'} w-[78%] max-w-[250px] md:w-[230px] shrink-0 bg-[hsl(44_45%_95%)] text-secondary p-4 shadow-[8px_10px_0_hsl(var(--primary))] rotate-[-3deg]`}
          style={{ transform: reduce ? undefined : 'translateZ(50px) rotateY(18deg)' }}
        >
          <div className="mono text-primary">Duyuru / Bilgilendirme</div>
          <div className="font-display font-extrabold text-xl leading-none mt-2">ÜCRETSİZ<br />YAZILIM<br />ATÖLYESİ</div>
          <p className="text-[11px] leading-snug mt-3" lang="tr">
            Kayıt için <mark className="bg-accent px-0.5">28 Ekim saat 15.00'e kadar</mark> formu doldurunuz. Atölye <mark className="bg-accent px-0.5">29 Ekim saat 14.00'te</mark> B Blok Zemin Kat Salon 2'de yapılacaktır.
          </p>
        </div>

        {/* The bridge */}
        <div
          className="flex md:items-end items-center justify-center gap-1.5 md:gap-1 md:px-3 py-2"
          style={{ transformStyle: 'preserve-3d', transform: reduce ? undefined : 'translateZ(20px)' }}
        >
          {Array.from({ length: PLANKS }, (_, i) => {
            const t = (i / (PLANKS - 1)) * 2 - 1;
            const arc = Math.round((1 - t * t) * 46);
            return <span key={i} className="plank" style={{ ['--i' as string]: i, ['--arc' as string]: arc } as CSSProperties} />;
          })}
        </div>

        {/* Action bank: clear card */}
        <div
          className={`${reduce ? '' : 'sway'} w-[78%] max-w-[250px] md:w-[230px] shrink-0 bg-accent text-secondary p-4 shadow-[-8px_10px_0_hsl(var(--background)/.9)] rotate-[2deg]`}
          style={{ transform: reduce ? undefined : 'translateZ(50px) rotateY(-18deg)', animationDelay: '-2s' }}
        >
          <div className="mono">KÖPRÜ found your next step</div>
          <div className="font-display font-extrabold text-2xl leading-tight mt-2">Register before<br />Oct 28, 3 PM.</div>
          <ul className="mt-3 space-y-1 text-xs font-medium">
            <li className="flex gap-2"><span className="mono">01</span> Fill out the form</li>
            <li className="flex gap-2"><span className="mono">02</span> Bring ID and laptop</li>
            <li className="flex gap-2"><span className="mono">03</span> Room 2, Block B</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
