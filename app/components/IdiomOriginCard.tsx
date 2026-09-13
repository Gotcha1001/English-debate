"use client";
import { HudPanel, HudLabel } from "./HudPanel";

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
  return (
    <HudPanel className="p-5">
      <HudLabel>Why &lsquo;{idiom}&rsquo;?</HudLabel>
      <p className="mb-4 text-cyan-100/90">{origin}</p>
      <div className="mb-4 rounded-lg border border-cyan-400/20 bg-[#0a1219] p-3">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-cyan-300/70">
          {idiom}
        </p>
        <p className="text-sm text-cyan-50">{example}</p>
      </div>
      <div className="space-y-3">
        {relatedExpressions.map((expr, i) => (
          <div
            key={i}
            className="rounded-lg border border-cyan-400/10 bg-[#0a1219] p-3"
          >
            <p className="mb-1 font-semibold text-cyan-200">{expr.phrase}</p>
            <p className="mb-2 text-sm text-cyan-200/60">{expr.meaning}</p>
            <p className="text-sm text-cyan-50">{expr.example}</p>
          </div>
        ))}
      </div>
    </HudPanel>
  );
}
