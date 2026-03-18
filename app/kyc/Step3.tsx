import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import {SmileIDBiometricKYCView} from '@smile_identity/react-native-expo';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import Toast from 'react-native-toast-message';

type FlowStep = 'template' | 'capturing';

interface Payload {
	nin: string;
	product_type: 'biometric_kyc' | 'authentication' | 'verification';
	template_id?: number;
}
interface initiateResponse {
	status: number;
	data: [];
	message: {
		data: {
			job_id: string;
			user_id: string;
			token: string | null;
			timestamp: string | null;
			partner_id: string;
			callback_url: string;
			product_type: string;
			signature: string | null;
			id_info: {
				country: string;
				id_type: string;
				id_number: string;
			};
			full_response: {
				code: string;
				error: string;
				statusCode: number;
			};
		};
	};
}
const Step3 = () => {
	const {nin} = useGlobalStore();
	const [flowStep, setFlowStep] = useState<FlowStep>('template');
	const [jobId, setJobId] = useState<string | null>(null);
	const [userId, setUserId] = useState<string>('');

	/* ── Call your backend to initiate the KYC job ── */

	useEffect(() => {
		const axiosClient = new AxiosClient();
		const handleProceed = async () => {
			try {
				const response = await axiosClient.post<Payload, initiateResponse>(
					'/kyc/initiate',
					{
						nin,
						product_type: 'biometric_kyc',
					},
				);
				const data = response.data.message.data;
				const code = Number(data.full_response?.code);
				if (code !== 200 && code !== 201) {
					Toast.show({
						type: 'error',
						text1: 'Verification Failed',
						text2:
							data.full_response?.error ??
							'Failed to start verification. Please try again.',
					});
					router.replace('/kyc/Step2');
					return;
				}
				setJobId(data.job_id);
				setUserId(data.user_id);
				setFlowStep('capturing');
			} catch (e: any) {
				Toast.show({
					type: 'error',
					text1: 'Verification Failed',
					text2:
						e?.message ?? 'Failed to start verification. Please try again.',
				});
				router.replace('/kyc/Step2');
			}
		};
		handleProceed();
	}, [nin]);
	/* ── SmileID SDK callbacks ── */
	const handleResult = (_result: any) => {
		// Real pass/fail arrives via your callback_url webhook → poll /kyc/status
		router.dismissTo('/(tabs)');
	};

	const handleError = (err: any) => {
		console.error('SmileID error:', JSON.stringify(err));
		setFlowStep('template');
	};

	/* ════════════════ SMILE ID FULLSCREEN CAPTURE ════════════════ */
	if (flowStep === 'capturing' && jobId) {
		return (
			<View className="bg-white flex-1">
				<SmileIDBiometricKYCView
					style={{flex: 1}}
					className="flex-1"
					params={{
						userId,
						jobId,
						allowNewEnroll: true,
						showAttribution: false,
						showInstructions: true,
						allowAgentMode: false,
						skipApiSubmission: false,
						idInfo: {
							country: 'NG',
							idType: 'NIN_V2',
							idNumber: nin,
						},
					}}
					onResult={handleResult}
					onError={handleError}
				/>
			</View>
		);
	}

	/* ════════════════ INSTRUCTIONS / TEMPLATE SCREEN ════════════════ */
	return (
		<View className="bg-white px-[5%] pt-5 pb-10 flex-1 justify-center items-center">
			<ActivityIndicator size={'large'} color={'#0D6EFD'} />
		</View>
	);
};

export default Step3;
