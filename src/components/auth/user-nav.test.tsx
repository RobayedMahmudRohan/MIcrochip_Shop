import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserNav } from "@/components/auth/user-nav";
import { logout } from "@/lib/auth/actions";
import type { SessionUser } from "@/lib/auth/session";

const state = vi.hoisted(() => ({ user: null as SessionUser | null }));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => state.user }));
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
  it("shows Login and Register when logged out", async () => {
    await renderNav();

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
    expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
  });

  it("shows the user's first name and Logout when logged in", async () => {
    state.user = { id: 1, name: "Ada Lovelace", role: "customer" };
    await renderNav();

    expect(screen.getByRole("link", { name: "Hi, Ada" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    expect(screen.queryByText(/Lovelace/)).not.toBeInTheDocument();
  });

  it("calls the logout server action when Logout is clicked", async () => {
    state.user = { id: 1, name: "Ada Lovelace", role: "customer" };
    await renderNav();

    await userEvent.setup().click(screen.getByRole("button", { name: "Logout" }));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
