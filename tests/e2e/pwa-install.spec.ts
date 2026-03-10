import { test, expect } from '@playwright/test';

test.describe('PWA asennuskehote', () => {
    test('näyttää asennuskehotteen beforeinstallprompt-eventistä ja kutsuu promptia', async ({ page }) => {
        await page.goto('/');

        await test.step('Simuloi beforeinstallprompt', async () => {
            await page.evaluate(() => {
                const event = new Event('beforeinstallprompt', { cancelable: true });
                Object.defineProperty(event, 'prompt', {
                    configurable: true,
                    value: () => {
                        (window as any).__pwaPromptCalled = true;
                        return Promise.resolve();
                    },
                });
                Object.defineProperty(event, 'userChoice', {
                    configurable: true,
                    value: Promise.resolve({ outcome: 'accepted', platform: 'web' }),
                });
                window.dispatchEvent(event);
            });
        });

        await test.step('Asennusbanneri tulee näkyviin', async () => {
            const installBanner = page.locator('.install-banner');
            await expect(installBanner).toHaveCount(1);
            await expect(installBanner).toContainText('Asenna sovellus puhelimesi aloitusnaytolle nopeaa kayttoa varten.');
            await expect(page.getByRole('button', { name: 'Asenna' })).toHaveCount(1);
        });

        await test.step('Asenna-nappi kutsuu promptia ja banneri sulkeutuu', async () => {
            await page.getByRole('button', { name: 'Asenna' }).click();
            await expect(page.locator('.install-banner')).toHaveCount(0);
            await expect.poll(async () => {
                return page.evaluate(() => Boolean((window as any).__pwaPromptCalled));
            }).toBe(true);
        });
    });

    test('sulje-painike piilottaa asennusbannerin', async ({ page }) => {
        await page.goto('/');

        await page.evaluate(() => {
            const event = new Event('beforeinstallprompt', { cancelable: true });
            Object.defineProperty(event, 'prompt', {
                configurable: true,
                value: () => Promise.resolve(),
            });
            Object.defineProperty(event, 'userChoice', {
                configurable: true,
                value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
            });
            window.dispatchEvent(event);
        });

        await expect(page.locator('.install-banner')).toHaveCount(1);
        await page.getByRole('button', { name: 'Sulje' }).click();
        await expect(page.locator('.install-banner')).toHaveCount(0);
    });
});
