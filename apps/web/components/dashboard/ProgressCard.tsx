import { Card } from "@/components/ui/Card";

export function ProgressCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </Card>
  );
}
