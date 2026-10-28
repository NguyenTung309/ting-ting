export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="eyebrow-mark mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      ) : null}
      <h1 className="text-balance text-4xl font-bold tracking-[-0.06em] text-brand-dark sm:text-6xl">
        {title}
      </h1>
      {description ? <p className="mt-5 text-lg leading-8 text-muted">{description}</p> : null}
    </div>
  );
}
