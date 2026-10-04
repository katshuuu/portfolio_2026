/**
 * Three scrolling ribbons after About.
 * Figma: Group 7 (horizontal), Group 8 (−7.53°), Group 9 (+3.48°).
 */

const TAPE_FONT = {
  fontFamily: '"Benzin-Bold", sans-serif',
  fontWeight: 400,
  fontSize: "clamp(18px, 2.22vw, 32px)",
  lineHeight: "44px",
  color: "#F5F5F5",
  textShadow: "0 1px 0 rgba(0, 0, 0, 0.28)",
} as const;

type TapeProps = {
  phrase: string;
  angle: number;
  height: number;
  letterSpacing?: string;
  duration: string;
  reverse?: boolean;
  withStar?: boolean;
};

function Tape({
  phrase,
  angle,
  height,
  letterSpacing = "0em",
  duration,
  reverse = false,
  withStar = true,
}: TapeProps) {
  const unit = (
    <span className="inline-flex shrink-0 items-center gap-[0.7em] pr-[0.7em]">
      <span>{phrase}</span>
      {withStar ? (
        <span
          aria-hidden
          className="relative inline-block shrink-0 overflow-hidden"
          style={{ width: "calc(1em * 41.5 / 32)", height: "calc(1em * 41.5 / 32)" }}
        >
          {/* Glyph ink is ~30px inside an 83px em; target star face is 41.5×41.5 at 32px text (half of 83) */}
          <span
            className="absolute left-1/2"
            style={{
              top: "calc(1em * -2 / 30 * 41.5 / 32)",
              transform: "translateX(-50%)",
            }}
          >
            <span
              className="block leading-none"
              style={{ fontSize: "calc(1em * 41.5 / 32 * 83 / 30)" }}
            >
              *
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );

  const copies = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="inline-flex shrink-0">
      {unit}
    </span>
  ));

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 w-[145vw]"
      style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
    >
      <div
        className="overflow-hidden border border-[#F5F5F5] bg-[#C7C1E8]"
        style={{ height }}
      >
        <div
          className={`marquee-track flex h-full w-max items-center whitespace-nowrap ${
            reverse ? "marquee-track--reverse" : ""
          }`}
          style={{ ...TAPE_FONT, letterSpacing, ["--marquee-duration" as string]: duration }}
        >
          {copies}
          {copies}
        </div>
      </div>
    </div>
  );
}

export function MarqueeTapes() {
  return (
    <section
      aria-label="Ленты"
      className="relative z-20 my-4 h-[360px] overflow-hidden sm:h-[410px]"
    >
      <Tape
        phrase="dream big - work hard"
        angle={0}
        height={56}
        duration="26s"
        withStar
      />
      <div className="absolute inset-x-0 top-[125px] sm:top-[140px]">
        <Tape
          phrase="мыслю креативно, работаю стабильно"
          angle={-7.53}
          height={56}
          letterSpacing="0.01em"
          duration="32s"
          reverse
          withStar
        />
      </div>
      <div className="absolute inset-x-0 top-[260px] sm:top-[290px]">
        <Tape
          phrase="учусь непрерывно —> расту постепенно"
          angle={3.48}
          height={63}
          letterSpacing="0.02em"
          duration="30s"
          withStar={false}
        />
      </div>
    </section>
  );
}
