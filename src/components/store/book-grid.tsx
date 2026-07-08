import { BookCard } from "./book-card";
import { EmptyState } from "./empty-state";
import type { Book } from "@/lib/types";

export function BookGrid({
  books,
  emptyMessage = "No books to show yet. Please check back soon.",
}: {
  books: Book[];
  emptyMessage?: string;
}) {
  if (books.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 content-start gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
