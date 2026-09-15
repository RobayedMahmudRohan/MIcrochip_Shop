type PlaceholderPageProps = {
  title: string;
  description?: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-md text-base text-muted">{description}</p>
      ) : null}
    </div>
  );
}
