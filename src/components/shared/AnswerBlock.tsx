import type { AnswerBlock as AnswerBlockData } from "~/lib/site";

// Featured-snippet / AEO format: the question as a short H2 with the self-
// contained 40–60-word answer directly beneath. Used as a page lead (e.g. the
// /services hub). The `words` field on the data is a build-time check only.
export function AnswerBlock({
  item,
  className = "",
}: {
  item: AnswerBlockData;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-display text-xl text-paper sm:text-2xl">{item.question}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-graphite">{item.answer}</p>
    </div>
  );
}
