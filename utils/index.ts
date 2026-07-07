export const errorFormat = (error: any) => {
	if (typeof error === 'string') {
		return error;
	} else {
		if (error.message && typeof error.message === 'string') {
			return error.message;
		}
		return JSON.stringify(error).slice(1, -1);
	}
};

// Format a number as Naira with up to 2 decimals and no trailing zeros
// e.g. 8491.5 -> "₦8,491.5", 99 -> "₦99", 346.5 -> "₦346.5"
export const formatNaira = (amount: number) =>
	`₦${Number(amount).toLocaleString('en-NG', {maximumFractionDigits: 2})}`;

// Apply a percentage discount expressed in percent-units (e.g. 1 => 1%, 0.1 => 0.1%)
// Returns the payable amount and the amount saved.
export const pctDiscount = (base: number, percent: number) => {
	const save = (base * percent) / 100;
	return {pay: base - save, save};
};

// Mask the middle of an account number, keeping the first and last 3 digits.
// e.g. "2123503170" -> "212****170"
export const maskAccountNumber = (num: string) => {
	if (!num || num.length <= 6) return num;
	return `${num.slice(0, 3)}${'*'.repeat(num.length - 6)}${num.slice(-3)}`;
};
