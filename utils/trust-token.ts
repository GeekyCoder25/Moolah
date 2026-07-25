import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEVICE_ID, TRUST_TOKEN_KEY} from '../constants';
import {MemoryStorage} from './storage';

// The trust token is sensitive, so it lives in SecureStore (via MemoryStorage).
// The device id is not sensitive, so it lives in AsyncStorage.
const secureStorage = new MemoryStorage();

export async function getTrustToken(): Promise<string | null> {
	try {
		return await secureStorage.getItem(TRUST_TOKEN_KEY);
	} catch {
		return null;
	}
}

export async function setTrustToken(token: string): Promise<void> {
	try {
		await secureStorage.setItem(TRUST_TOKEN_KEY, token);
	} catch {
		// non-fatal: worst case the user sees OTP again next login
	}
}

export async function clearTrustToken(): Promise<void> {
	try {
		await secureStorage.removeItem(TRUST_TOKEN_KEY);
	} catch {
		// ignore
	}
}

// Returns a stable per-install device id, generating and persisting one the
// first time it is requested.
export async function getDeviceId(): Promise<string> {
	try {
		const existing = await AsyncStorage.getItem(DEVICE_ID);
		if (existing) return existing;
		const id = generateUuid();
		await AsyncStorage.setItem(DEVICE_ID, id);
		return id;
	} catch {
		// If storage fails, still return a (non-persisted) id so login can proceed.
		return generateUuid();
	}
}

// RFC-4122-style v4 UUID. Uses Math.random — fine for a non-secret device id.
function generateUuid(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
		const r = (Math.random() * 16) | 0;
		const v = char === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
