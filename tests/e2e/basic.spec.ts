import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should allow login with correct password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="password"]', process.env.ACCESS_PASSWORD || 'development');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="password"]', process.env.ACCESS_PASSWORD || 'development');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display empty state', async ({ page }) => {
    await expect(page.locator('text=Halo! Bagaimana saya bisa membantu')).toBeVisible();
  });

  test('should show composer', async ({ page }) => {
    await expect(page.locator('textarea[placeholder*="Ketik pesan"]')).toBeVisible();
  });
});
