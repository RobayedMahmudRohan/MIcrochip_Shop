import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileDrawer } from "@/components/auth/profile-drawer";

vi.mock("next/navigation", () => ({ usePathname: () => "/orders" }));
vi.mock("@/lib/auth/actions", () => ({ logout: vi.fn() }));

function setup() {
  render(<ProfileDrawer name="Ada Lovelace" email="ada@example.com" />);
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Hi, Ada" });
  return { user, trigger };
}

function drawer() {
  return screen.getByRole("dialog", { hidden: true });
}

describe("ProfileDrawer", () => {
  it("opens with the user's name, email and account links", async () => {
    const { user, trigger } = setup();
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(drawer()).toHaveAttribute("open");
    expect(drawer()).toHaveAccessibleName("Ada Lovelace");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();

    const nav = screen.getByRole("navigation", { name: "Account" });
    const links = [
      ["Profile", "/profile"],
      ["My Orders", "/orders"],
      ["Saved Builds", "/saved-builds"],
      ["Settings", "/settings"],
    ] as const;
    for (const [name, href] of links) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(nav).toContainElement(screen.getByRole("link", { name: "Profile" }));
    expect(screen.getByRole("link", { name: "My Orders" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("closes from the close button and returns focus to the trigger", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);

    await user.click(screen.getByRole("button", { name: "Close account menu" }));

    expect(drawer()).not.toHaveAttribute("open");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes when the backdrop is clicked, but not when the panel is", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);

    await user.click(screen.getByText("ada@example.com"));
    expect(drawer()).toHaveAttribute("open");

    fireEvent.click(drawer());
    expect(drawer()).not.toHaveAttribute("open");
  });

  it("closes when a navigation link is clicked", async () => {
    const { user, trigger } = setup();
    await user.click(trigger);

    const link = screen.getByRole("link", { name: "Saved Builds" });
    link.addEventListener("click", (event) => event.preventDefault());
    await user.click(link);

    expect(drawer()).not.toHaveAttribute("open");
  });
});
