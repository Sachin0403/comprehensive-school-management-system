import { type LucideIcon } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'primary' }: {
  label: string; value: string | number; icon: LucideIcon; color?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    destructive: 'bg-red-50 text-red-600',
    blue: 'bg-sky-50 text-sky-600',
  };
  return (
    <div className="bg-card rounded-xl border p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.primary}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
