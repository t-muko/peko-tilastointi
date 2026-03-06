/**
 * Playwright global setup — tarkistaa että Firebase-emulaattori on käynnissä
 * ennen kuin yhtäkään testiä ajetaan.
 *
 * Jos emulaattori ei vastaa, heitetään selkeä virhe ohjeineen.
 */

const AUTH_EMULATOR = 'http://localhost:9099';
const FIRESTORE_EMULATOR = 'http://localhost:8080';

async function checkEmulator(url: string, name: string): Promise<void> {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (err: any) {
        const reason =
            err.name === 'AbortError'
                ? 'ei vastannut 3 sekunnissa (timeout)'
                : err.message ?? String(err);

        throw new Error(
            `\n` +
            `╔══════════════════════════════════════════════════════════════╗\n` +
            `║          FIREBASE-EMULAATTORI EI OLE KÄYNNISSÄ               ║\n` +
            `╠══════════════════════════════════════════════════════════════╣\n` +
            `║  ${name.padEnd(62)}║\n` +
            `║  Osoite : ${url.padEnd(53)}║\n` +
            `║  Virhe  : ${reason.slice(0, 53).padEnd(53)}║\n` +
            `╠══════════════════════════════════════════════════════════════╣\n` +
            `║  Käynnistä emulaattori ennen E2E-testejä:                    ║\n` +
            `║                                                              ║\n` +
            `║    firebase emulators:start --only firestore,auth            ║\n` +
            `║                                                              ║\n` +
            `║  Katso lisätiedot: docs/E2E-testaus.md                       ║\n` +
            `╚══════════════════════════════════════════════════════════════╝\n`
        );
    }
}

export default async function globalSetup(): Promise<void> {
    await checkEmulator(`${AUTH_EMULATOR}/`, 'Auth-emulaattori (portti 9099)');
    await checkEmulator(`${FIRESTORE_EMULATOR}/`, 'Firestore-emulaattori (portti 8080)');

    console.log('✓ Firebase Auth- ja Firestore-emulaattorit käynnissä');
}
