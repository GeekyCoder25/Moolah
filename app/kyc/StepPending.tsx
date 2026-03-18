import SuccessIcon from '@/assets/icons/success';
import {AxiosClient} from '@/utils/axios';
import {router} from 'expo-router';
import {useLocalSearchParams} from 'expo-router/build/hooks';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import Button from '../components/button';

type KycStatus = 'pending' | 'approved' | 'failed';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~60 seconds

interface Response {
	job_id: string;
	status: 'pending' | 'approved' | 'failed' | 'rejected';
	face_match: boolean;
	nin_match: boolean;
	liveness_score: number | null;
	confidence_value: number | null;
	rejection_reason: string | null;
}
const StepPending = () => {
	const {jobId} = useLocalSearchParams();
	const [status, setStatus] = useState<KycStatus>('pending');
	const [rejectionReason, setRejectionReason] = useState<string | null>(null);
	const [pollCount, setPollCount] = useState(0);
	const [timedOut, setTimedOut] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollCountRef = useRef(0);
	const axiosClient = new AxiosClient();

	console.log(jobId);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const startPolling = () => {
		pollCountRef.current = 0;
		setPollCount(0);
		setTimedOut(false);

		intervalRef.current = setInterval(async () => {
			pollCountRef.current += 1;
			setPollCount(pollCountRef.current);

			if (pollCountRef.current >= MAX_POLLS) {
				stopPolling();
				setTimedOut(true);
				return;
			}
			try {
				// GET /kyc/status/:job_id → { success, data: { status, rejection_reason, ... } }
				const response = await axiosClient.get<Response>(
					`/kyc/status/${jobId}` as string,
				);

				if (response.data.status === 'approved') {
					stopPolling();
					setStatus('approved');
				} else if (
					response.data.status === 'failed' ||
					response.data.status === 'rejected'
				) {
					stopPolling();
					setRejectionReason(response.data.rejection_reason ?? null);
					setStatus('failed');
				}
				// 'pending' → keep polling
			} catch {
				// network hiccup — keep polling silently
			}
		}, POLL_INTERVAL_MS);
	};

	useEffect(() => {
		startPolling();
		return () => stopPolling();
	}, [startPolling]);

	const stopPolling = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	/* ════════ APPROVED ════════ */
	if (status === 'approved') {
		return (
			<View className="flex-1">
				<View className="flex-1 justify-center items-center gap-y-10 px-[5%]">
					<SuccessIcon />
					<View className="items-center gap-y-2">
						<Text className="font-bold text-2xl text-center">
							Verification Successful
						</Text>
						<Text className="text-[#6B7280] text-center text-sm">
							Your identity has been verified successfully.
						</Text>
					</View>
				</View>
				<View className="px-[5%] my-10">
					<Button title="Continue" onPress={() => router.dismissAll()} />
				</View>
			</View>
		);
	}

	/* ════════ FAILED ════════ */
	if (status === 'failed') {
		return (
			<View className="flex-1">
				<View className="flex-1 justify-center items-center gap-y-10 px-[5%]">
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 40,
							backgroundColor: '#FEE2E2',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text style={{fontSize: 36}}>✗</Text>
					</View>
					<View className="items-center gap-y-2">
						<Text className="font-bold text-2xl text-center">
							Verification Failed
						</Text>
						<Text className="text-[#6B7280] text-center text-sm px-4">
							{rejectionReason
								? rejectionReason
								: 'We could not verify your identity. Please ensure your selfie matches your NIN details and try again.'}
						</Text>
					</View>
				</View>
				<View className="px-[5%] my-10 gap-y-3">
					<Button
						title="Try Again"
						onPress={() => router.replace('/kyc/Step3')}
					/>
					<Text
						className="text-secondary font-semibold text-base text-center mt-2"
						onPress={() => router.dismissAll()}
					>
						Do this later
					</Text>
				</View>
			</View>
		);
	}

	/* ════════ TIMED OUT ════════ */
	if (timedOut) {
		return (
			<View className="flex-1">
				<View className="flex-1 justify-center items-center gap-y-6 px-[5%]">
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 40,
							backgroundColor: '#FEF3C7',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Text style={{fontSize: 36}}>⏱</Text>
					</View>
					<View className="items-center gap-y-2">
						<Text className="font-bold text-2xl text-center">
							Still Processing
						</Text>
						<Text className="text-[#6B7280] text-center text-sm px-4">
							Your verification is taking longer than usual. We&apos;ll notify
							you once it&apos;s complete. You can safely close this screen.
						</Text>
					</View>
				</View>
				<View className="px-[5%] my-10 gap-y-3">
					<Button title="Check Status" onPress={startPolling} />
					<Text
						className="text-secondary font-semibold text-base text-center mt-2"
						onPress={() => router.dismissAll()}
					>
						Go Home
					</Text>
				</View>
			</View>
		);
	}

	/* ════════ PENDING / POLLING ════════ */
	return (
		<View className="flex-1 bg-white justify-center items-center px-[5%] gap-y-8">
			<View
				style={{
					width: 100,
					height: 100,
					borderRadius: 50,
					backgroundColor: '#F5F3FF',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<ActivityIndicator size="large" color="#4F46E5" />
			</View>

			<View className="items-center gap-y-2">
				<Text className="font-bold text-2xl text-center">
					Verifying your identity
				</Text>
				<Text className="text-[#6B7280] text-center text-sm px-4">
					We&apos;re matching your selfie against your NIN record. This usually
					takes a few seconds.
				</Text>
			</View>

			<View className="w-full bg-[#F9FAFB] rounded-2xl p-5 gap-y-4">
				{[
					{label: 'Selfie submitted', done: true},
					{label: 'Liveness check', done: pollCount > 2},
					{label: 'NIN record lookup', done: pollCount > 5},
					{label: 'Biometric matching', done: pollCount > 8},
				].map(step => (
					<View key={step.label} className="flex-row items-center gap-x-3">
						<View
							style={{
								width: 22,
								height: 22,
								borderRadius: 11,
								backgroundColor: step.done ? '#4F46E5' : '#E5E7EB',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{step.done && (
								<Text
									style={{color: 'white', fontSize: 12, fontWeight: 'bold'}}
								>
									✓
								</Text>
							)}
						</View>
						<Text
							className={`text-sm ${
								step.done ? 'text-[#111827] font-medium' : 'text-[#9CA3AF]'
							}`}
						>
							{step.label}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
};

export default StepPending;
