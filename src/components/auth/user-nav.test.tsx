import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserNav } from "@/components/auth/user-nav";
import { logout } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/session";

const state = vi.hoisted(() => ({ user: null as SessionUser | null }));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => state.user }));
vi.mock("@/lib/data/users", () => ({ findUserEmailById: async () => "ada@example.com" }));
vi.mock("@/lib/auth/actions", () => ({ logout: vi.fn(), login: vi.fn(), register: vi.fn() }));

// UserNav is an async Server Component: resolve it, then render the result.
async function renderNav() {
  const nav = await UserNav();
  render(<ul>{nav}</ul>);
}

beforeEach(() => {
  state.user = null;
  vi.mocked(logout).mockReset();
});

describe("UserNav", () => {
  it("shows only Login when logged out", async () => {
    await renderNav();

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hi,/ })).not.toBeInTheDocument();
  });

  it("shows the account menu button instead of Login when logged in", async () => {
    state.user = { id: 1, name: "Ada Lovelace", role: "customer" };
    await renderNav();

    expect(screen.getByRole("button", { name: "Hi, Ada" })).toHaveAttribute(
      "aria-haspopup",
      "dialog",
    );
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
  });

  it("signs out through the logout server action from the drawer", async () => {
    state.user = { id: 1, name: "Ada Lovelace", role: "customer" };
    await renderNav();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Hi, Ada" }));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
