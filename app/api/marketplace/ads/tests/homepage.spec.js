
const { test, expect } = require('@playwright/test');

test('PetSphere homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/localhost:3000/);
  await expect(page.locator('body')).toBeVisible();

  await page.screenshot({
    path: 'homepage-test.png',
    fullPage: true,
  });
});
