import * as SecureStore from 'expo-secure-store';

import {StorageInterface} from './storage.types';

export class MemoryStorage implements StorageInterface {
	async getItem(key: string): Promise<string | null> {
		return await SecureStore.getItemAsync(key);
	}

	async setItem(key: string, value: string): Promise<void> {
		return await SecureStore.setItemAsync(key, value);
	}

	async removeItem(key: string): Promise<void> {
		return await SecureStore.deleteItemAsync(key);
	}

	async checkItem(key: string): Promise<boolean> {
		return ['', null].includes(await this.getItem(key));
	}
}
