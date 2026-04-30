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
	email_verified: boolean;
	mobile_verified: boolean;
	verification_status: boolean;
	referral_link: string;
	nin_status: string;
	kyc_status: string;
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
		requires_device_verification: boolean;
		verification_token: string | null;
	};
}

export type FeeType = 'percent' | 'fixed';

export interface Settings {
	facebook: string;
	whatsapp: string;
	twitter: string;
	telegram: string;
	instagram: string;
	whatsapp_group: string;
	email: string;
	phone: string;
	terms: string | null;
	privacy: string | null;
	about: string | null;
	google_play_url: string;
	apple_app_url: string;
	checkout_deposit_message: string;
	checkout_deposit_cap: number;
	checkout_below_cap_fee_type: FeeType;
	checkout_below_cap_fee: number;
	checkout_above_cap_fee_type: FeeType;
	checkout_above_cap_fee: number;
	wallet_deposit_message: string;
	wallet_deposit_cap: number;
	wallet_below_cap_fee_type: FeeType;
	wallet_below_cap_fee: number;
	wallet_above_cap_fee_type: FeeType;
	wallet_above_cap_fee: number;
}

export interface SettingsResponse {
	status: number;
	message: string;
	data: Settings;
}
