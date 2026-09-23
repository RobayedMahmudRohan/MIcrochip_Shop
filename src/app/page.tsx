import { ButtonLink } from "@/components/button-link";
import ChatWidget from "@/components/chat/chat-widget";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <span className="text-sm font-medium tracking-wide text-accent uppercase">
        Electronics &amp; components
      </span>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Microchip Shop
      </h1>
      <p className="mt-3 max-w-md text-base text-muted sm:text-lg">
        Project foundation is set up. Product pages, cart, and checkout will
        be built in later phases.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/products" variant="primary">
          Browse Products
        </ButtonLink>
        <ButtonLink href="/custom-build" variant="secondary">
          Request a Custom Build
        </ButtonLink>
      </div>

      <ChatWidget />
    </div>
  );
}
