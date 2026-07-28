export default function PageHeader({ title, description, children }: {
  title: string; description?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-2 lg:pt-0">
      <div>
        <h2 className="text-2xl font-bold text-foreground tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
