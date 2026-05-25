import { BookCard } from "@/components/library/BookCard";
import { books } from "@/lib/data";

export default function LibraryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Biblioteca</h1>
        <p className="mt-2 text-slate-600">Libros y cuadernos para practicar temas concretos.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        {books.map((book) => <BookCard key={book.id} book={book} />)}
      </div>
    </div>
  );
}
