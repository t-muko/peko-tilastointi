import { test, expect } from '@playwright/test';
import { clearEmulatorData, createTestUser, seedReenit } from './helpers/emulator';
import { loginAsTestUser, TEST_USER } from './helpers/auth';
import { REENI_FIXTURES } from './fixtures/reenit';

test.describe('Reeni-lista', () => {
    test.beforeEach(async ({ page }) => {
        await clearEmulatorData();
        const { localId } = await createTestUser(TEST_USER.email, TEST_USER.password);
        await seedReenit(localId, REENI_FIXTURES);
        await page.goto('/');
        await loginAsTestUser(page);
    });

    test('fixture-data renderöityy listaan', async ({ page }) => {
        await expect(page.getByText('Jälki').first()).toBeVisible();
        await expect(page.getByText('Partsa').first()).toBeVisible();
        await expect(page.getByText('Ilmavainu').first()).toBeVisible();
        await expect(page.getByText('Tottis').first()).toBeVisible();
    });

    test('päivämäärät näkyvät suomalaisessa muodossa', async ({ page }) => {
        await expect(page.getByText(/15\.3\.2024/).first()).toBeVisible();
    });

    test('tunnit näkyvät', async ({ page }) => {
        await expect(page.getByText('1.5 h').first()).toBeVisible();
    });
});

test.describe('Hakusuodatus', () => {
    test.beforeEach(async ({ page }) => {
        await clearEmulatorData();
        const { localId } = await createTestUser(TEST_USER.email, TEST_USER.password);
        await seedReenit(localId, REENI_FIXTURES);
        await page.goto('/');
        await loginAsTestUser(page);
    });

    test('haku kategorian perusteella suodattaa listan', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        await searchInput.fill('Jälki');

        await expect(page.getByText('Jälki').first()).toBeVisible();
        await expect(page.getByText('Partsa')).not.toBeVisible();
        await expect(page.getByText('Ilmavainu')).not.toBeVisible();
    });

    test('haku koiran nimen perusteella toimii', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        await searchInput.fill('Kakkoskoira');

        await expect(page.getByText('Partsa').first()).toBeVisible();
        await expect(page.getByText('Tottis').first()).toBeVisible();
        await expect(page.getByText('Jälki')).not.toBeVisible();
        await expect(page.getByText('Ilmavainu')).not.toBeVisible();
    });

    test('AND-haku useammalla sanalla toimii', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        // Ykköskoira + Ilmavainu — pitäisi löytyä vain yksi kirjaus
        await searchInput.fill('Ykköskoira Ilmavainu');

        await expect(page.getByText('Ilmavainu').first()).toBeVisible();
        await expect(page.getByText('Jälki')).not.toBeVisible();
        await expect(page.getByText('Partsa')).not.toBeVisible();
    });

    test('haku vuosiluvulla suodattaa oikealle vuodelle', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        await searchInput.fill('2023');

        // Vain 2023-kirjaus (Tottis) jää
        await expect(page.getByText('Tottis').first()).toBeVisible();
        await expect(page.getByText('Jälki')).not.toBeVisible();
        await expect(page.getByText('Partsa')).not.toBeVisible();
        await expect(page.getByText('Ilmavainu')).not.toBeVisible();
    });

    test('tyhjennysnappi poistaa haun ja palauttaa kaikki', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        await searchInput.fill('Partsa');
        await expect(page.getByText('Jälki')).not.toBeVisible();

        await page.getByRole('button', { name: /clear/i }).click();

        await expect(page.getByText('Jälki').first()).toBeVisible();
        await expect(page.getByText('Partsa').first()).toBeVisible();
        await expect(page.getByText('Ilmavainu').first()).toBeVisible();
    });

    test('haulla joka ei täsmää lista on tyhjä', async ({ page }) => {
        const searchInput = page.getByPlaceholder(/Hae esim/i);
        await searchInput.fill('xxxx-ei-loydY');

        await expect(page.getByText('Jälki')).not.toBeVisible();
        await expect(page.getByText('Partsa')).not.toBeVisible();
    });
});
