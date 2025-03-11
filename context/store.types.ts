import {Transaction} from '@/app/(tabs)';
import {UserAttributes} from '@/app/types';

export interface GlobalState {
	isLoggedIn: boolean;
	setIsLoggedIn: (isLoggedIn: boolean) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	darkMode: boolean;
	setDarkMode: (darkMode: boolean) => void;
	showPin: boolean;
	setShowPin: (showPin: boolean) => void;
	user: UserAttributes | null;
	setUser: (user: UserAttributes | null) => void;
	transactions: Transaction[];
	setTransactions: (transactions: Transaction[]) => void;
}
