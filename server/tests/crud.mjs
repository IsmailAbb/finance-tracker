// End-to-end smoke test for every CRUD endpoint.
// Run after `npm run build` with the server *not* running — this script starts no
// server itself; spawn one separately on port 5000 first.

const BASE = process.env.BASE_URL || "http://localhost:5000";

let passed = 0;
let failed = 0;
const fails = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    fails.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? " — " + JSON.stringify(detail) : ""}`);
  }
}

async function req(method, path, { token, body, expect = 200 } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { status: res.status, data, ok: res.status === expect };
}

function section(name) {
  console.log(`\n── ${name} ──────────────────────────────────────`);
}

async function main() {
  const stamp = Date.now();
  const email = `test-${stamp}@example.com`;
  const password = "supersecret123";
  const newPassword = "evenmoresecret456";

  // ───── Health ─────
  section("Health");
  {
    const r = await req("GET", "/health");
    check("GET /health returns ok", r.status === 200 && r.data?.status === "ok", r);
  }

  // ───── Auth: register ─────
  section("Auth — register");
  let token, userId;
  {
    const r = await req("POST", "/auth/register", { body: { email, password, name: "CRUD Tester" }, expect: 201 });
    check("POST /auth/register 201", r.status === 201, r);
    check("register returns token", !!r.data?.token, r.data);
    check("register returns user with currency=USD default", r.data?.user?.currency === "USD", r.data?.user);
    check("register does NOT leak password hash", r.data?.user?.password === undefined, r.data?.user);
    token = r.data.token;
    userId = r.data.user.id;
  }

  // ───── Register validation ─────
  section("Auth — validation");
  {
    const r = await req("POST", "/auth/register", { body: { email: `b-${stamp}@x.com`, password: "short" }, expect: 400 });
    check("short password rejected with 400", r.status === 400 && Array.isArray(r.data?.issues), r);
  }
  {
    const r = await req("POST", "/auth/register", { body: { email: "not-an-email", password: "longenough" }, expect: 400 });
    check("invalid email rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/auth/register", { body: { email, password, name: "dupe" }, expect: 409 });
    check("duplicate email rejected with 409", r.status === 409, r);
  }

  // ───── Auth: login ─────
  section("Auth — login");
  {
    const r = await req("POST", "/auth/login", { body: { email, password } });
    check("valid login returns 200 + token", r.status === 200 && !!r.data?.token, r);
    token = r.data.token; // refresh
  }
  {
    const r = await req("POST", "/auth/login", { body: { email, password: "wrong" }, expect: 401 });
    check("bad password returns 401", r.status === 401, r);
  }

  // ───── Auth middleware: bad/missing token ─────
  section("Auth middleware");
  {
    const r = await req("GET", "/users/me", { expect: 401 });
    check("missing token returns 401", r.status === 401, r);
  }
  {
    const r = await req("GET", "/users/me", { token: "garbage", expect: 401 });
    check("invalid token returns 401", r.status === 401, r);
  }

  // ───── Users: me get + patch ─────
  section("Users — me");
  {
    const r = await req("GET", "/users/me", { token });
    check("GET /users/me 200", r.status === 200, r);
    check("me does not include password", r.data?.password === undefined, r.data);
    check("me currency = USD", r.data?.currency === "USD", r.data);
  }
  {
    const r = await req("PATCH", "/users/me", { token, body: { name: "Updated Name", currency: "EUR" } });
    check("PATCH /users/me updates name", r.data?.name === "Updated Name", r.data);
    check("PATCH /users/me updates currency", r.data?.currency === "EUR", r.data);
  }

  // ───── Change password ─────
  section("Auth — change password");
  {
    const r = await req("POST", "/auth/change-password", { token, body: { currentPassword: "wrong", newPassword }, expect: 400 });
    check("wrong current password returns 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/auth/change-password", { token, body: { currentPassword: password, newPassword } });
    check("valid change-password returns 200", r.status === 200, r);
  }
  {
    const r = await req("POST", "/auth/login", { body: { email, password: newPassword } });
    check("login works with new password", r.status === 200, r);
    token = r.data.token;
  }
  {
    const r = await req("POST", "/auth/login", { body: { email, password }, expect: 401 });
    check("login fails with old password", r.status === 401, r);
  }

  // ───── Categories: list (defaults seeded on register) ─────
  section("Categories");
  let incomeCategory, expenseCategory;
  {
    const r = await req("GET", "/categories", { token });
    check("GET /categories 200", r.status === 200, r);
    check("default categories seeded", Array.isArray(r.data) && r.data.length >= 10, { count: r.data?.length });
    incomeCategory = r.data.find((c) => c.type === "income");
    expenseCategory = r.data.find((c) => c.type === "expense");
    check("at least one income category exists", !!incomeCategory, incomeCategory);
    check("at least one expense category exists", !!expenseCategory, expenseCategory);
  }
  let customCategory;
  {
    const r = await req("POST", "/categories", { token, body: { name: "Test Cat", type: "expense", color: "#aabbcc" }, expect: 201 });
    check("POST /categories 201 with color", r.status === 201 && r.data?.color === "#aabbcc", r);
    customCategory = r.data;
  }
  {
    const r = await req("POST", "/categories", { token, body: { name: "Test Cat", type: "notatype" }, expect: 400 });
    check("invalid category type rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/categories", { token, body: { name: "Bad Color", type: "expense", color: "red" }, expect: 400 });
    check("invalid color format rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/categories", { token, body: { name: "Color Clash", type: "expense", color: "#aabbcc" }, expect: 409 });
    check("duplicate color (same type) rejected with 409", r.status === 409, r);
  }
  {
    // Same color but different type should be allowed.
    const r = await req("POST", "/categories", { token, body: { name: "Income Same Color", type: "income", color: "#aabbcc" }, expect: 201 });
    check("same color in different type is allowed", r.status === 201, r);
    if (r.status === 201) await req("DELETE", `/categories/${r.data.id}`, { token });
  }
  {
    const r = await req("PUT", `/categories/${customCategory.id}`, { token, body: { name: "Renamed", color: "#ddeeff" } });
    check("PUT /categories/:id renames + recolors", r.data?.name === "Renamed" && r.data?.color === "#ddeeff", r.data);
  }
  {
    const r = await req("PUT", "/categories/99999999", { token, body: { name: "x" }, expect: 404 });
    check("PUT non-existent category 404", r.status === 404, r);
  }

  // ───── Accounts ─────
  section("Accounts");
  let defaultAccount;
  {
    const r = await req("GET", "/accounts", { token });
    check("GET /accounts 200", r.status === 200, r);
    check("default Cash account seeded", Array.isArray(r.data) && r.data.some((a) => a.name === "Cash"), r.data);
    defaultAccount = r.data.find((a) => a.name === "Cash");
    check("default account currentBalance = 0", defaultAccount.currentBalance === 0, defaultAccount);
  }
  let customAccount;
  {
    const r = await req("POST", "/accounts", { token, body: { name: "Bank", initialBalance: 500 }, expect: 201 });
    check("POST /accounts 201 with initialBalance", r.status === 201, r);
    check("created account currentBalance = initialBalance", r.data?.currentBalance === 500, r.data);
    customAccount = r.data;
  }
  {
    const r = await req("POST", "/accounts", { token, body: { name: "Bank" }, expect: 500 });
    check("duplicate account name rejected (Prisma unique constraint)", r.status >= 400, r);
  }
  {
    const r = await req("PUT", `/accounts/${customAccount.id}`, { token, body: { name: "Bank — Renamed", initialBalance: 600 } });
    check("PUT /accounts/:id updates name + balance", r.data?.name === "Bank — Renamed" && r.data?.initialBalance === 600, r.data);
  }

  // ───── Transactions ─────
  section("Transactions");
  let incomeTx, expenseTx;
  {
    const r = await req("POST", "/transactions", {
      token,
      body: { amount: 1000, date: new Date().toISOString(), description: "Paycheck", accountId: customAccount.id, categoryId: incomeCategory.id },
      expect: 201,
    });
    check("POST /transactions 201 (income)", r.status === 201, r);
    check("transaction includes account + category", !!r.data?.account && !!r.data?.category, r.data);
    incomeTx = r.data;
  }
  {
    const r = await req("POST", "/transactions", {
      token,
      body: { amount: 50, date: new Date().toISOString(), description: "Lunch", accountId: customAccount.id, categoryId: expenseCategory.id },
      expect: 201,
    });
    check("POST /transactions 201 (expense)", r.status === 201, r);
    expenseTx = r.data;
  }
  {
    const r = await req("POST", "/transactions", {
      token,
      body: { amount: -50, date: new Date().toISOString(), accountId: customAccount.id },
      expect: 400,
    });
    check("negative amount rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/transactions", {
      token,
      body: { amount: 10, date: "not-a-date", accountId: customAccount.id },
      expect: 400,
    });
    check("invalid date rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("POST", "/transactions", {
      token,
      body: { amount: 10, date: new Date().toISOString(), accountId: 99999999 },
      expect: 400,
    });
    check("transaction on foreign account rejected with 400", r.status === 400, r);
  }
  {
    const r = await req("GET", "/transactions", { token });
    check("GET /transactions returns ≥ 2", Array.isArray(r.data) && r.data.length >= 2, { count: r.data?.length });
  }

  // ───── Balance derivation ─────
  section("Account balance derivation");
  {
    const r = await req("GET", "/accounts", { token });
    const acct = r.data.find((a) => a.id === customAccount.id);
    // initialBalance=600, +1000 income, -50 expense => 1550
    check("currentBalance reflects income + expense", acct?.currentBalance === 1550, acct);
  }

  // ───── Update transaction ─────
  {
    const r = await req("PUT", `/transactions/${expenseTx.id}`, { token, body: { amount: 75 } });
    check("PUT /transactions/:id updates amount", r.data?.amount === 75, r.data);
  }
  {
    const r = await req("GET", "/accounts", { token });
    const acct = r.data.find((a) => a.id === customAccount.id);
    // 600 + 1000 - 75 = 1525
    check("currentBalance updates after PUT", acct?.currentBalance === 1525, acct);
  }

  // ───── Delete transaction ─────
  {
    const r = await req("DELETE", `/transactions/${expenseTx.id}`, { token });
    check("DELETE /transactions/:id 200", r.status === 200, r);
  }
  {
    const r = await req("DELETE", "/transactions/99999999", { token, expect: 404 });
    check("DELETE non-existent transaction 404", r.status === 404, r);
  }
  {
    const r = await req("GET", "/accounts", { token });
    const acct = r.data.find((a) => a.id === customAccount.id);
    // 600 + 1000 = 1600
    check("currentBalance updates after DELETE", acct?.currentBalance === 1600, acct);
  }

  // ───── Cross-user isolation ─────
  section("Cross-user isolation");
  let otherToken;
  {
    const r = await req("POST", "/auth/register", { body: { email: `other-${stamp}@x.com`, password: "anothersecret" }, expect: 201 });
    otherToken = r.data.token;
  }
  {
    const r = await req("PUT", `/transactions/${incomeTx.id}`, { token: otherToken, body: { amount: 1 }, expect: 404 });
    check("other user cannot update foreign transaction (404)", r.status === 404, r);
  }
  {
    const r = await req("DELETE", `/accounts/${customAccount.id}`, { token: otherToken, expect: 404 });
    check("other user cannot delete foreign account (404)", r.status === 404, r);
  }

  // ───── Delete category cascade ─────
  section("Cleanup — categories");
  {
    const r = await req("DELETE", `/categories/${customCategory.id}`, { token });
    check("DELETE custom category 200", r.status === 200, r);
  }

  // ───── Delete account cascade ─────
  section("Cleanup — account");
  {
    const r = await req("DELETE", `/accounts/${customAccount.id}`, { token });
    check("DELETE custom account 200 (cascades transactions)", r.status === 200, r);
  }
  {
    const r = await req("GET", "/transactions", { token });
    const hasOrphan = r.data.some((t) => t.accountId === customAccount.id);
    check("transactions for deleted account are gone", !hasOrphan, { count: r.data.length });
  }

  // ───── Delete users (cascades everything) ─────
  section("Cleanup — users");
  {
    const r = await req("DELETE", "/users/me", { token });
    check("DELETE /users/me 200", r.status === 200, r);
  }
  {
    const r = await req("GET", "/users/me", { token, expect: 401 });
    check("token invalidated... actually JWT still valid but user gone — expect 404", r.status === 404 || r.status === 401, r);
  }
  {
    const r = await req("DELETE", "/users/me", { token: otherToken });
    check("DELETE other user 200", r.status === 200, r);
  }

  // ───── Summary ─────
  console.log(`\n══════════════════════════════════════════════`);
  console.log(`  PASSED: ${passed}    FAILED: ${failed}`);
  console.log(`══════════════════════════════════════════════`);
  if (failed > 0) {
    console.log("\nFailures:");
    for (const f of fails) console.log("  •", f.name, "—", JSON.stringify(f.detail));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
