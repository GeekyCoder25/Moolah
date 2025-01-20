export interface GlobalState {
	isLoggedIn: boolean;
	setIsLoggedIn: (isLoggedIn: boolean) => void;
	loading: boolean;
	setLoading: (loading: boolean) => void;
	darkMode: boolean;
	setDarkMode: (darkMode: boolean) => void;
	showPin: boolean;
	setShowPin: (showPin: boolean) => void;
}
