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
