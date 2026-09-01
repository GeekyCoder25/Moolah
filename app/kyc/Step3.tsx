import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import {SmileIDBiometricKYCView} from '@smile_identity/react-native-expo';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
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
				token?: string;
				success?: boolean;
				error?: string;
				code?: string;
				statusCode?: number;
			};
		};
	};
}
const Step3 = () => {
	const {nin} = useGlobalStore();
	const [flowStep, setFlowStep] = useState<FlowStep>('template');
	const [jobId, setJobId] = useState<string | null>(null);
	const [userId, setUserId] = useState<string>('');

	// The native capture view swallows the swipe-back gesture, so give both
	// states an explicit way out.
	const goBack = () => {
		if (router.canGoBack()) router.back();
		else router.replace('/(tabs)');
	};

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
				// Success is signalled either by full_response.success === true or a
				// 200/201 `code`, depending on the response shape — accept both.
				const code = Number(data.full_response?.code);
				const succeeded =
					data.full_response?.success === true || code === 200 || code === 201;
				if (!succeeded) {
					Toast.show({
						type: 'error',
						text1: 'Verification Failed',
						text2:
							data.full_response?.error ||
							'Failed to start verification. Please try again.',
					});
					router.replace('/kyc/Step2');
					return;
				}
				setJobId(data.job_id);
				setUserId(data.user_id);
				setFlowStep('capturing');
			} catch (e: any) {
				console.log(e);
				// Non-2xx (e.g. 422 "NIN already used") throws here — surface the
				// backend's message, not axios's "Request failed with status code".
				Toast.show({
					type: 'error',
					text1: 'Verification Failed',
					text2:
						e.response?.data?.message ||
						e?.message ||
						'Failed to start verification. Please try again.',
				});
				router.replace('/kyc/Step2');
			}
		};
		handleProceed();
	}, [nin]);
	/* ── SmileID SDK callbacks ── */
	const handleResult = (_result: any) => {
		// The real pass/fail arrives asynchronously via the callback webhook, so
		// hand off to the polling screen to watch /kyc/status for this job.
		router.replace({
			pathname: '/kyc/StepPending',
			params: {jobId: jobId ?? ''},
		});
	};

	const handleError = (err: any) => {
		// The SDK passes a React synthetic event; the real message lives on
		// nativeEvent.error (the object itself is circular, so don't stringify it).
		const message =
			err?.nativeEvent?.error ??
			err?.message ??
			'Verification could not be started';
		console.log('SmileID error:', message);
		Toast.show({
			type: 'error',
			text1: 'Verification error',
			text2: String(message),
		});
		goBack();
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
				{/* Overlay back button — raised above the native capture view. */}
				<TouchableOpacity
					onPress={goBack}
					hitSlop={12}
					style={{
						position: 'absolute',
						top: 12,
						left: 20,
						zIndex: 10,
						elevation: 10,
					}}
					className="w-11 h-11 rounded-full bg-black/50 items-center justify-center"
				>
					<Ionicons name="arrow-back" size={24} color="#fff" />
				</TouchableOpacity>
			</View>
		);
	}

	/* ════════════════ INSTRUCTIONS / TEMPLATE SCREEN ════════════════ */
	return (
		<View className="bg-white px-[5%] pt-5 pb-10 flex-1">
			<TouchableOpacity
				onPress={goBack}
				hitSlop={12}
				className="w-11 h-11 rounded-full bg-black/10 items-center justify-center"
			>
				<Ionicons name="arrow-back" size={24} color="#111" />
			</TouchableOpacity>
			<View className="flex-1 justify-center items-center">
				<ActivityIndicator size={'large'} color={'#0D6EFD'} />
			</View>
		</View>
	);
};

export default Step3;
