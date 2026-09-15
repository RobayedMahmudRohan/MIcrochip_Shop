export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-6 text-center text-sm text-muted">
        <p className="font-semibold text-foreground">Microchip Shop</p>
        <p className="mt-1">
          &copy; {year} Microchip Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
