export interface EmailVerificationResponse {
	data: {
		email_verified: boolean;
	};
	message: string;
}

interface BankDetails {
	name: string;
	account_no: string | null;
}

export interface UserAttributes {
	apikey: string;
	firstname: string;
	lastname: string;
	email: string;
	phone_number: string;
	state: string | null;
	wallet_balance: number;
	referral_wallet_balance: number;
	apiKey: string;
	verification_status: boolean;
	referral_link: string;
	banks: BankDetails[];
	created_at: string;
}

export interface UserResponse {
	status: number;
	message: string;
	data: {
		type: string;
		id: number;
		attributes: UserAttributes;
		email_verified: boolean;
	};
}
