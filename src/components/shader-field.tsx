"use client";

import { GrainGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";

/**
 * World A atmosphere — a slow grainy gradient in warm paper tones.
 * NOT the library's default neon; driven entirely in our palette, low speed,
 * so it reads as warm paper catching light rather than a lava lamp.
 * Frozen under prefers-reduced-motion.
 */
export function ShaderField({ className }: { className?: string }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <GrainGradient
      className={className}
      colorBack="#f1ede3"
      colors={["#efe7d6", "#e6d9c2", "#cc9e6d"]}
      softness={0.9}
      intensity={0.34}
      noise={0.42}
      shape="corners"
      speed={reduced ? 0 : 0.18}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
