
const { test, expect } = require('@playwright/test');

test('TC01 - Homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

test('TC02 - Homepage refresh works', async ({ page }) => {
  await page.goto('/');
  await page.reload();
  await expect(page.locator('body')).toBeVisible();
});

test('TC03 - Invalid URL returns 404', async ({ page }) => {
  const response = await page.goto('/this-page-should-not-exist-12345');
  expect(response.status()).toBe(404);
});
