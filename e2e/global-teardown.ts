import { deleteE2EUsers } from "./db";

// Runs once after all workers finish, so no test's user is deleted mid-run.
export default async function globalTeardown() {
  await deleteE2EUsers();
}
