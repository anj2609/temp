import { test, expect, type Page } from "@playwright/test";

/**
 * These tests exercise the headline feature: state sync across browser tabs
 * over BroadcastChannel. Two pages in the same browser context behave like two
 * tabs in one browser profile, so BroadcastChannel messages propagate between
 * them exactly as they would for a real user.
 */

const amountField = (page: Page) =>
  page.getByLabel("Loan amount", { exact: true });

async function waitForApp(page: Page) {
  await expect(amountField(page)).toBeVisible();
}

test.describe("cross-tab sync", () => {
  test("a loan input edited in one tab appears in the other", async ({ browser }) => {
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    await tabA.goto("/");
    await tabB.goto("/");
    await waitForApp(tabA);
    await waitForApp(tabB);

    await amountField(tabA).fill("2000000");
    await amountField(tabA).press("Enter");

    // tabB never touched its own input; the value arrives over BroadcastChannel.
    await expect(amountField(tabB)).toHaveValue("2000000");

    await context.close();
  });

  test("theme toggle propagates to every tab", async ({ browser }) => {
    const context = await browser.newContext();
    const tabA = await context.newPage();
    const tabB = await context.newPage();

    await tabA.goto("/");
    await tabB.goto("/");
    await waitForApp(tabA);
    await waitForApp(tabB);

    const initial = (await tabB.locator("html").getAttribute("data-theme")) ?? "light";
    const next = initial === "dark" ? "light" : "dark";

    await tabA.getByRole("button", { name: "Toggle theme" }).click();

    await expect(tabA.locator("html")).toHaveAttribute("data-theme", next);
    await expect(tabB.locator("html")).toHaveAttribute("data-theme", next);

    await context.close();
  });

  test("presence count reflects the number of open tabs", async ({ browser }) => {
    const context = await browser.newContext();
    const tabA = await context.newPage();

    await tabA.goto("/");
    await waitForApp(tabA);
    await expect(tabA.getByText("1 session live")).toBeVisible();

    const tabB = await context.newPage();
    await tabB.goto("/");
    await waitForApp(tabB);

    // Heartbeat presence should discover the second tab in both directions.
    await expect(tabA.getByText("2 sessions live")).toBeVisible();
    await expect(tabB.getByText("2 sessions live")).toBeVisible();

    await tabB.close();
    // TAB_BYE on close should drop the count back to one within a heartbeat.
    await expect(tabA.getByText("1 session live")).toBeVisible();

    await context.close();
  });

  test("a freshly opened tab hydrates from the live workspace", async ({ browser }) => {
    const context = await browser.newContext();
    const tabA = await context.newPage();

    await tabA.goto("/");
    await waitForApp(tabA);

    await amountField(tabA).fill("1750000");
    await amountField(tabA).press("Enter");
    await expect(amountField(tabA)).toHaveValue("1750000");

    // Open a second tab AFTER the change; the leader hands off current state.
    const tabB = await context.newPage();
    await tabB.goto("/");
    await waitForApp(tabB);

    await expect(amountField(tabB)).toHaveValue("1750000");

    await context.close();
  });
});
