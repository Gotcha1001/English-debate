"use client";

import { HudPanel, HudLabel } from "./HudPanel";
import { useColorTheme } from "@/app/context/ColorThemeContext";

interface RelatedExpression {
  phrase: string;
  meaning: string;
  example: string;
}

interface IdiomOriginCardProps {
  idiom: string;
  origin: string;
  example: string;
  relatedExpressions: RelatedExpression[];
}

/** "The Origin" section: the idiom's backstory, its own example sentence,
 * then 1-2 related expressions each with their own meaning + example --
 * same visual language as the reference "Why 'Off the Record'?" panel. */
export function IdiomOriginCard({
  idiom,
  origin,
  example,
  relatedExpressions,
}: IdiomOriginCardProps) {
  const { theme } = useColorTheme();
  const { hex400, shades } = theme;

  return (
    <HudPanel className="p-5">
      <HudLabel>Why &lsquo;{idiom}&rsquo;?</HudLabel>
      <p className="mb-4 text-stone-100">{origin}</p>
      <div
        className="mb-4 rounded-lg bg-[#0a1219] p-3"
        style={{ border: `1px solid ${hex400}33` }}
      >
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-wide"
          style={{ color: `${shades[300]}b3` }}
        >
          {idiom}
        </p>
        <p className="text-sm text-stone-50">{example}</p>
      </div>
      <div className="space-y-3">
        {relatedExpressions.map((expr, i) => (
          <div
            key={i}
            className="rounded-lg bg-[#0a1219] p-3"
            style={{ border: `1px solid ${hex400}1a` }}
          >
            <p className="mb-1 font-semibold text-stone-200">{expr.phrase}</p>
            <p className="mb-2 text-sm text-stone-400">{expr.meaning}</p>
            <p className="text-sm text-stone-50">{expr.example}</p>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}
