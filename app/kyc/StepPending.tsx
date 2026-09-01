import {AxiosClient} from '@/utils/axios';
import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import {useLocalSearchParams} from 'expo-router/build/hooks';
import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import Button from '../components/button';

type KycStatus = 'pending' | 'approved' | 'failed';

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~60 seconds

// Shared centered result layout: tinted icon badge, title, message, and a
// bottom action area — reused by the approved / failed / timed-out states.
const ResultView = ({
	tint,
	iconName,
	iconColor,
	title,
	message,
	children,
}: {
	tint: string;
	iconName: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	title: string;
	message: string;
	children: React.ReactNode;
}) => (
	<View className="flex-1 bg-white">
		<View className="flex-1 justify-center items-center px-8">
			<View
				style={{backgroundColor: tint}}
				className="w-24 h-24 rounded-full items-center justify-center"
			>
				<Ionicons name={iconName} size={48} color={iconColor} />
			</View>
			<Text className="font-bold text-2xl text-center text-[#0F172A] mt-8">
				{title}
			</Text>
			<Text className="text-[#64748B] text-center text-base leading-6 mt-3 font-medium">
				{message}
			</Text>
		</View>
		<View className="px-6 pb-10">{children}</View>
	</View>
);

const StepPending = () => {
	const {jobId} = useLocalSearchParams();
	const [status, setStatus] = useState<KycStatus>('pending');
	const [rejectionReason, setRejectionReason] = useState<string | null>(null);
	const [pollCount, setPollCount] = useState(0);
	const [timedOut, setTimedOut] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const pollCountRef = useRef(0);
	const axiosClient = new AxiosClient();

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
				// Cache-bust every poll: without this, okhttp / the CDN revalidate with
				// If-Modified-Since and keep serving the stale "pending" response, so the
				// status never appears to change on device. The unique `t` + no-cache
				// headers force a fresh read from origin each time.
				const response = await axiosClient.get(
					`/kyc/status/${jobId}?t=${Date.now()}`,
					{
						headers: {
							'Cache-Control': 'no-cache, no-store',
							Pragma: 'no-cache',
						},
					},
				);
				// The record may arrive wrapped in { success, data: {...} } or flat —
				// normalise so we read the status either way.
				const body: any = response.data;
				const result = body?.data ?? body;
				const jobStatus: string = result?.status;

				if (
					['approved', 'completed', 'accepted', 'success'].includes(jobStatus)
				) {
					stopPolling();
					setStatus('approved');
				} else if (['failed', 'rejected'].includes(jobStatus)) {
					stopPolling();
					setRejectionReason(result?.rejection_reason ?? null);
					setStatus('failed');
				}
				// 'pending' (or anything else) → keep polling
			} catch (e: any) {
				// Keep polling through transient errors, but surface them so a
				// consistently-failing status endpoint isn't hidden behind the timeout.
				console.log('KYC status poll error:', e?.response?.status, e?.message);
			}
		}, POLL_INTERVAL_MS);
	};

	useEffect(() => {
		startPolling();
		return () => stopPolling();
		// Run once on mount. Depending on startPolling (recreated every render)
		// would restart the interval and reset pollCount on every tick.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const stopPolling = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	/* ════════ APPROVED ════════ */
	if (status === 'approved') {
		return (
			<ResultView
				tint="#DCFCE7"
				iconName="shield-checkmark"
				iconColor="#16A34A"
				title="Verification Successful"
				message="Your identity has been verified. All features are now unlocked."
			>
				<Button title="Continue" onPress={() => router.dismissAll()} />
			</ResultView>
		);
	}

	/* ════════ FAILED ════════ */
	if (status === 'failed') {
		return (
			<ResultView
				tint="#FEE2E2"
				iconName="close-circle"
				iconColor="#DC2626"
				title="Verification Failed"
				message={
					rejectionReason ??
					'We could not verify your identity. Make sure your selfie matches your NIN details and try again.'
				}
			>
				<Button
					title="Try Again"
					onPress={() => router.replace('/kyc/Step3')}
				/>
				<Text
					className="text-secondary font-semibold text-base text-center py-4 mt-1"
					onPress={() => router.dismissAll()}
				>
					Do this later
				</Text>
			</ResultView>
		);
	}

	/* ════════ TIMED OUT ════════ */
	if (timedOut) {
		return (
			<ResultView
				tint="#FEF3C7"
				iconName="time-outline"
				iconColor="#D97706"
				title="Still Processing"
				message="This is taking longer than usual. We'll notify you once it's complete — you can safely leave this screen."
			>
				<Button title="Check Status" onPress={startPolling} />
				<Text
					className="text-secondary font-semibold text-base text-center py-4 mt-1"
					onPress={() => router.dismissAll()}
				>
					Go Home
				</Text>
			</ResultView>
		);
	}

	/* ════════ PENDING / POLLING ════════ */
	const steps = [
		{label: 'Selfie submitted', done: true},
		{label: 'Liveness check', done: pollCount > 2},
		{label: 'NIN record lookup', done: false},
		{label: 'Biometric matching', done: false},
	];
	// The first not-yet-done step is the one currently in progress.
	const activeIndex = steps.findIndex(s => !s.done);

	return (
		<View className="flex-1 bg-white px-8 justify-center items-center gap-y-8">
			<View className="w-24 h-24 rounded-full bg-[#E7F0FF] items-center justify-center">
				<ActivityIndicator size="large" color="#0D6EFD" />
			</View>

			<View className="items-center">
				<Text className="font-bold text-2xl text-center text-[#0F172A]">
					Verifying your identity
				</Text>
				<Text className="text-[#64748B] text-center text-base leading-6 mt-3 font-medium">
					We&apos;re matching your selfie against your NIN record. This usually
					takes a few seconds.
				</Text>
			</View>

			<View className="w-full bg-[#F8FAFC] rounded-2xl p-5 gap-y-4 border border-[#EEF2F7]">
				{steps.map((step, index) => {
					const active = index === activeIndex;
					return (
						<View key={step.label} className="flex-row items-center gap-x-3">
							<View
								className={`w-6 h-6 rounded-full items-center justify-center ${
									step.done
										? 'bg-[#16A34A]'
										: active
											? 'bg-[#E7F0FF]'
											: 'bg-[#E5E7EB]'
								}`}
							>
								{step.done ? (
									<Ionicons name="checkmark" size={14} color="#fff" />
								) : active ? (
									<ActivityIndicator size="small" color="#0D6EFD" />
								) : null}
							</View>
							<Text
								className={`text-base flex-1 ${
									step.done
										? 'text-[#0F172A] font-semibold'
										: active
											? 'text-[#0F172A] font-medium'
											: 'text-[#94A3B8]'
								}`}
							>
								{step.label}
							</Text>
						</View>
					);
				})}
			</View>
		</View>
	);
};

export default StepPending;
