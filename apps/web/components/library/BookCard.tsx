import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Book } from "@/lib/types";

export function BookCard({ book }: { book: Book }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-slate-900">{book.title}</h3>
      <p className="mt-2 text-slate-600">{book.description}</p>
      <p className="mt-3 text-sm text-slate-500">{book.notebooks.length} cuaderno(s)</p>
      <Link href={`/notebooks?book=${book.id}`} className="mt-5 inline-flex rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        Abrir libro
      </Link>
    </Card>
  );
}
