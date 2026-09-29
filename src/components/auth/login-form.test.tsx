import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/login-form";
import { login } from "@/lib/auth/actions";

vi.mock("@/lib/auth/actions", () => ({ register: vi.fn(), login: vi.fn() }));

const loginMock = vi.mocked(login);

beforeEach(() => {
  loginMock.mockReset();
  loginMock.mockResolvedValue({});
});

describe("LoginForm", () => {
  it("renders labelled fields and a submit button", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByRole("button", { name: "Log in" })).toBeEnabled();
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("validates email and password before submitting", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "nope");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address.",
    );
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription(
      "Password is required.",
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("submits credentials and the return path to the server action", async () => {
    const user = userEvent.setup();
    render(<LoginForm next="/profile" />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "engine1843");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(loginMock).toHaveBeenCalledTimes(1);
    expect(Object.fromEntries(loginMock.mock.calls[0][1])).toEqual({
      next: "/profile",
      email: "ada@example.com",
      password: "engine1843",
    });
    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/register?next=%2Fprofile",
    );
  });

  it("announces the generic invalid-credentials error and clears the password", async () => {
    loginMock.mockResolvedValue({
      message: "Invalid email or password.",
      fields: { email: "ada@example.com" },
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-pass1");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password.");
    expect(screen.getByLabelText("Email")).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Password")).toHaveValue("");
  });

  it("disables the button while logging in", async () => {
    loginMock.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Password"), "engine1843");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("button", { name: "Logging in…" })).toBeDisabled();
  });
});
