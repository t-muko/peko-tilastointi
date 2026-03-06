/**
 * Apufunktiot Firebase-emulaattorin hallintaan Playwright-testeissä.
 * Kaikki kutsut kohdistuvat paikalliseen emulaattoriin, ei tuotantoon.
 */

const AUTH_EMULATOR = 'http://localhost:9099';
const FIRESTORE_EMULATOR = 'http://localhost:8080';
const PROJECT_ID = 'peko-tilastointi';

/**
 * Luo testikäyttäjän Auth-emulaattoriin.
 * Palauttaa { idToken, localId, email }.
 */
export async function createTestUser(email: string, password: string) {
    const res = await fetch(
        `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
    );
    if (!res.ok) throw new Error(`createTestUser epäonnistui: ${res.status} ${await res.text()}`);
    return res.json() as Promise<{ idToken: string; localId: string; email: string }>;
}

/**
 * Nollaa Auth- ja Firestore-emulaattorien tilan.
 * Kutsu ennen jokaista testitapausta.
 */
export async function clearEmulatorData() {
    await Promise.all([
        fetch(
            `${FIRESTORE_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
            { method: 'DELETE' }
        ),
        fetch(
            `${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`,
            { method: 'DELETE' }
        ),
    ]);
}

/**
 * Muuntaa plain JS -objektin Firestore REST API:n odottamaan kenttämuotoon.
 */
function toFirestoreFields(obj: Record<string, any>): Record<string, any> {
    const fields: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            fields[key] = { stringValue: value };
        } else if (typeof value === 'number') {
            fields[key] = { doubleValue: value };
        } else if (typeof value === 'boolean') {
            fields[key] = { booleanValue: value };
        }
    }
    return fields;
}

/**
 * Kirjoittaa harjoituskirjaukset Firestore-emulaattoriin.
 * @param uid - Käyttäjän UID (Auth-emulaattorin localId)
 * @param docs - Kirjausdokumentit reeni-tietomallista
 */
export async function seedReenit(uid: string, docs: Record<string, any>[]) {
    for (const doc of docs) {
        const res = await fetch(
            `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/reenit/${uid}/reenit`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: toFirestoreFields(doc) }),
            }
        );
        if (!res.ok) throw new Error(`seedReenit epäonnistui: ${res.status} ${await res.text()}`);
    }
}
