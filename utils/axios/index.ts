import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
} from 'axios';

import {ACCESS_TOKEN_KEY, IS_LOGGED_IN} from '../../constants';
import {BASE_API_URL} from '../../constants/env-vars';
import {MemoryStorage} from '../storage';
import {StorageInterface} from '../storage/storage.types';
import {AxiosClientProps} from './axios.types';
import {useGlobalStore} from '../../context/store';

export class AxiosClient {
	_axiosClient: AxiosInstance;
	_storageClass: StorageInterface;
	_onAccessTokenExpire?: () => void;

	constructor({
		baseUrl,
		axiosClient,
		storageClass,
		onAccessTokenExpire,
	}: AxiosClientProps = {}) {
		this._axiosClient = axiosClient || axios.create({});
		this._axiosClient.defaults.baseURL = baseUrl || BASE_API_URL;

		this._storageClass = storageClass || new MemoryStorage();
		this._onAccessTokenExpire =
			onAccessTokenExpire || this.defaultOnAccessTokenExpire;

		this.mountInterceptors();
	}

	private async defaultOnAccessTokenExpire() {
		const isLoggedIn = useGlobalStore.getState().isLoggedIn;
		if (isLoggedIn) {
			const storage = new MemoryStorage();
			await storage.removeItem(ACCESS_TOKEN_KEY);
			await storage.removeItem(IS_LOGGED_IN);
			// useGlobalStore.getState().reset();
		}
	}

	private async mountInterceptors() {
		this._axiosClient.interceptors.request.use(async config => {
			const tokenExists =
				(await this._storageClass.getItem(ACCESS_TOKEN_KEY)) != null;

			if (tokenExists) {
				config.headers.Authorization = `Bearer ${await this._storageClass.getItem(
					ACCESS_TOKEN_KEY
				)}`;
			}

			return config;
		});

		// if reponse status is 401, call referesh token api and retry
		this._axiosClient.interceptors.response.use(
			response => response,
			async (error: AxiosError<Error>) => {
				if (error.config && error?.response?.status === 401) {
					this._onAccessTokenExpire?.();
				}

				return Promise.reject(error);
			}
		);

		this._axiosClient.interceptors.request.use(config => {
			if (!config.url?.includes('?') && !config.url?.endsWith('/')) {
				config.url += '/';
			}

			return config;
		});
	}

	custom(config: AxiosRequestConfig) {
		return this._axiosClient(config);
	}

	get<R = unknown>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<R, R>> {
		return this.custom({method: 'get', url, ...config});
	}

	post<T, R = unknown>(
		url: string,
		data?: T,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<R, R>> {
		return this.custom({method: 'post', url, data, ...config});
	}

	put<T, R = unknown>(
		url: string,
		data?: T,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<R, R>> {
		return this.custom({method: 'put', url, data, ...config});
	}

	patch<T, R = unknown>(
		url: string,
		data?: T,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<R, R>> {
		return this.custom({method: 'patch', url, data, ...config});
	}

	delete<R = unknown>(
		url: string,
		config?: AxiosRequestConfig
	): Promise<AxiosResponse<R, R>> {
		return this.custom({method: 'delete', url, ...config});
	}
}
