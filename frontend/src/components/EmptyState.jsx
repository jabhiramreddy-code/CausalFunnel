/**
 * EmptyState — shown when a page has no data.
 * Reusable: pass icon, title, description as props.
 */
export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4">
        <Icon className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">{description}</p>
    </div>
  );
}
