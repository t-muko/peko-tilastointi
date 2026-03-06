import { test, expect } from '@playwright/test';
import { clearEmulatorData, createTestUser } from './helpers/emulator';
import { loginAsTestUser, TEST_USER } from './helpers/auth';
import { seedReenit } from './helpers/emulator';
import { REENI_FIXTURES } from './fixtures/reenit';

test.describe('Kirjautuminen', () => {
    test.beforeEach(async () => {
        await clearEmulatorData();
    });

    test('kirjautumaton käyttäjä näkee login-napin eikä reeni-listaa', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
        // Reeni-lista ei saa näkyä kirjautumattomalle
        await expect(page.getByPlaceholder(/Hae esim/i)).not.toBeVisible();
    });

    test('kirjautuminen onnistuu ja reeni-lista latautuu', async ({ page }) => {
        const { localId } = await createTestUser(TEST_USER.email, TEST_USER.password);
        await seedReenit(localId, REENI_FIXTURES);

        await page.goto('/');
        await loginAsTestUser(page);

        // Login-nappi katoaa
        await expect(page.getByRole('button', { name: /login/i })).not.toBeVisible();
        // Hakulaatikko tulee näkyviin
        await expect(page.getByPlaceholder(/Hae esim/i)).toBeVisible();
        // Fixture-datasta Jälki-kirjaus näkyy
        await expect(page.getByText('Jälki').first()).toBeVisible();
    });

    test('uloskirjautuminen palauttaa kirjautumisnäkymän', async ({ page }) => {
        const { localId } = await createTestUser(TEST_USER.email, TEST_USER.password);
        await seedReenit(localId, REENI_FIXTURES);

        await page.goto('/');
        await loginAsTestUser(page);

        // Odotetaan kirjautunut näkymä
        await expect(page.getByPlaceholder(/Hae esim/i)).toBeVisible();

        // Logout
        await page.getByRole('button', { name: /logout|kirjaudu ulos/i }).click();

        // Login-nappi palaa
        await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
        // Hakulaatikko katoaa
        await expect(page.getByPlaceholder(/Hae esim/i)).not.toBeVisible();
    });
});
