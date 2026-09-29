// In-memory stand-ins for the database, cookie store and Next.js navigation
// helpers, so auth logic can be unit-tested without MySQL or a running server.
// The fake DB only understands the queries issued by src/lib/auth.

type FakeUser = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
};

type FakeSession = { userId: number; expiresAt: number };

export class FakeDb {
  users: FakeUser[] = [];
  sessions = new Map<string, FakeSession>();
  private nextId = 1;

  addUser(user: Omit<FakeUser, "id" | "role"> & { role?: FakeUser["role"] }) {
    const created = { id: this.nextId++, role: "customer" as const, ...user };
    this.users.push(created);
    return created;
  }

  query = async (sql: string, params: unknown[] = []): Promise<[unknown, unknown]> => {
    const q = sql.replace(/\s+/g, " ").trim();

    if (q.startsWith("SELECT id FROM users WHERE email = ?")) {
      return [this.users.filter((u) => u.email === params[0]).map(({ id }) => ({ id })), []];
    }
    if (q.startsWith("SELECT id, password_hash FROM users WHERE email = ?")) {
      return [
        this.users
          .filter((u) => u.email === params[0])
          .map(({ id, password_hash }) => ({ id, password_hash })),
        [],
      ];
    }
    if (q.startsWith("INSERT INTO users")) {
      const [name, email, password_hash] = params as string[];
      if (this.users.some((u) => u.email === email)) {
        throw Object.assign(new Error("Duplicate entry"), { code: "ER_DUP_ENTRY" });
      }
      const user = this.addUser({ name, email, password_hash });
      return [{ insertId: user.id }, []];
    }
    if (q.startsWith("DELETE FROM sessions WHERE user_id = ?")) {
      for (const [id, s] of this.sessions) {
        if (s.userId === params[0] && s.expiresAt <= Date.now()) this.sessions.delete(id);
      }
      return [{}, []];
    }
    if (q.startsWith("INSERT INTO sessions")) {
      const [id, userId, days] = params as [string, number, number];
      this.sessions.set(id, { userId, expiresAt: Date.now() + days * 86_400_000 });
      return [{}, []];
    }
    if (q.startsWith("DELETE FROM sessions WHERE id = ?")) {
      this.sessions.delete(params[0] as string);
      return [{}, []];
    }
    if (q.includes("FROM sessions s INNER JOIN users u")) {
      const session = this.sessions.get(params[0] as string);
      const user = session && session.expiresAt > Date.now()
        ? this.users.find((u) => u.id === session.userId)
        : undefined;
      return [user ? [{ id: user.id, name: user.name, role: user.role }] : [], []];
    }

    throw new Error(`FakeDb: unexpected query: ${q}`);
  };
}

type CookieOptions = Record<string, unknown>;

export class FakeCookieStore {
  jar = new Map<string, { value: string; options: CookieOptions }>();

  get = (name: string) => {
    const cookie = this.jar.get(name);
    return cookie ? { name, value: cookie.value } : undefined;
  };

  set = (name: string, value: string, options: CookieOptions = {}) => {
    this.jar.set(name, { value, options });
  };

  delete = (name: string) => {
    this.jar.delete(name);
  };
}

// Mirrors Next.js: redirect() and notFound() throw to abort rendering.
export class RedirectSignal extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT: ${url}`);
  }
}

export class NotFoundSignal extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
  }
}
