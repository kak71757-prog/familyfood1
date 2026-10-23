/** Small shared helpers — pure functions only. */
export const fmt = (n: number): string => `${n.toLocaleString("en-US")} MAD`;

export const uid = (): string => `ORD-${Date.now().toString(36).toUpperCase()}`;

/** Builds a click-to-chat WhatsApp URL (number in international format). */
export const waLink = (number: string, message: string): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

export const prettyTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

/** Synthesised notification ding — zero audio assets (WebAudio only). */
export function ding(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const play = (freq: number, at: number): void => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + at); o.stop(ctx.currentTime + at + 0.55);
    };
    play(880, 0); play(1320, 0.18);
  } catch { /* audio blocked — non fatal */ }
}
