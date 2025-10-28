import {create} from 'zustand';
import {GlobalState} from './store.types';

export const useGlobalStore = create<GlobalState>(set => ({
	isLoggedIn: false,
	setIsLoggedIn: isLoggedIn => set({isLoggedIn}),
	loading: false,
	setLoading: loading => set({loading}),
	darkMode: false,
	setDarkMode: darkMode => set({darkMode}),
	showPin: false,
	setShowPin: showPin => set({showPin}),
	user: null,
	setUser: user => set({user}),
	transactions: [],
	setTransactions: transactions => set({transactions}),
	accessToken: '',
	setAccessToken: accessToken => set({accessToken}),
}));
