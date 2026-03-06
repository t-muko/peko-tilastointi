import type { Page } from '@playwright/test';

export const TEST_USER = {
    email: 'testi@peko.fi',
    password: 'test1234',
};

/**
 * Kirjaa testikäyttäjän sisään selaimen Firebase SDK:lla.
 * Vaatii, että window.__rootStore on asetettu (VITE_USE_EMULATOR=true).
 */
export async function loginAsTestUser(page: Page) {
    await page.evaluate(async ({ email, password }) => {
        const rootStore = (window as any).__rootStore;
        await rootStore.firebase.autentikoiTestissa(email, password);
    }, TEST_USER);

    // Odotetaan, että kirjautuminen päivittää UI:n
    await page.waitForFunction(() => {
        const rootStore = (window as any).__rootStore;
        return rootStore?.sessionStore?.userOk === true;
    }, { timeout: 10000 });
}
