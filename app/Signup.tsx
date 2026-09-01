import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {AxiosClient} from '@/utils/axios';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {useQuery} from '@tanstack/react-query';
import {router} from 'expo-router';
import React, {useEffect, useState} from 'react';
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import Button from './components/button';

const randomDigits = (n: number) =>
	Math.floor(Math.random() * Math.pow(10, n))
		.toString()
		.padStart(n, '0');

// One-off availability check (outside react-query) used by the suggester loop.
const checkUsernameAvailable = async (name: string) => {
	try {
		const axiosClient = new AxiosClient();
		const res = await axiosClient.get<{data: {available: boolean}}>(
			`/check-username/${name}`,
		);
		return res.data.data.available;
	} catch {
		return false;
	}
};

const Signup = () => {
	const {setLoading, registerErrors, setRegisterErrors} = useGlobalStore();
	const [formData, setFormData] = useState({
		fname: '',
		lname: '',
		username: '',
		sEmail: '',
		sPhone: '',
		password: '',
		password_confirmation: '',
		referral: '',
		pin: '',
		state: '',
	});
	const [error, setError] = useState(formData);
	const [showPassword, setShowPassword] = useState(false);

	// Field errors returned by /register (done on the SetPin screen) are handed
	// back here so they show under the matching inputs.
	useEffect(() => {
		if (registerErrors) {
			setError(prev => ({...prev, ...registerErrors}));
			setRegisterErrors(null);
		}
	}, [registerErrors, setRegisterErrors]);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [suggesting, setSuggesting] = useState(false);

	// Debounce the username so we only hit /check-username after typing settles.
	const [debouncedUsername, setDebouncedUsername] = useState('');
	useEffect(() => {
		const timer = setTimeout(
			() => setDebouncedUsername(formData.username),
			400,
		);
		return () => clearTimeout(timer);
	}, [formData.username]);

	const {data: usernameCheck, isFetching: checkingUsername} = useQuery({
		queryKey: ['check-username', debouncedUsername],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const res = await axiosClient.get<{
				status: number;
				message: string;
				data: {available: boolean};
			}>(`/check-username/${debouncedUsername}`);
			return res.data;
		},
		enabled: debouncedUsername.length >= 3,
	});

	// True while the user is still typing (ahead of the debounce) or the request
	// is in flight. `available` is only meaningful for the settled username.
	const usernameSettled = formData.username === debouncedUsername;
	const usernameChecking =
		formData.username.length >= 3 && (!usernameSettled || checkingUsername);
	const usernameAvailable = usernameSettled
		? usernameCheck?.data.available
		: undefined;

	// Live password requirements checklist.
	const pw = formData.password;
	const passwordRequirements = [
		{label: 'At least 8 characters', met: pw.length >= 8},
		{label: 'At most 16 characters', met: pw.length > 0 && pw.length <= 16},
		{label: 'Contains at least one uppercase letter', met: /[A-Z]/.test(pw)},
		{label: 'Contains at least one lowercase letter', met: /[a-z]/.test(pw)},
		{label: 'Contains at least one number', met: /[0-9]/.test(pw)},
		{
			label: 'Contains at least one special character (!@#$%^&*)',
			met: /[!@#$%^&*]/.test(pw),
		},
	];
	const passwordValid = passwordRequirements.every(r => r.met);
	const passwordsMatch =
		formData.password_confirmation.length > 0 &&
		formData.password === formData.password_confirmation;

	const isFormValid =
		formData.fname.trim() !== '' &&
		formData.lname.trim() !== '' &&
		formData.username.trim() !== '' &&
		// Block only when the username is confirmed taken; unknown/errored passes
		// through to the backend as the final gate.
		usernameAvailable !== false &&
		formData.sEmail.trim() !== '' &&
		formData.sPhone.trim() !== '' &&
		passwordValid &&
		passwordsMatch;

	// Generate a username from the user's name when available (else generic),
	// trying candidates until one is actually available.
	const suggestUsername = async () => {
		const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
		const f = clean(formData.fname);
		const l = clean(formData.lname);

		const bases: string[] = [];
		if (f && l) {
			bases.push(`${f}${l}`, `${f}_${l}`, `${f[0]}${l}`, `${l}${f[0]}`);
		} else if (f || l) {
			bases.push(f || l);
		} else {
			bases.push('user');
		}

		// Plain bases first, then numbered variants, then a pure-random fallback.
		const candidates: string[] = [];
		bases.forEach(b => b.length >= 3 && candidates.push(b));
		bases.forEach(b => {
			candidates.push(`${b}${randomDigits(2)}`);
			candidates.push(`${b}${randomDigits(4)}`);
		});
		candidates.push(`user${randomDigits(5)}`);

		setSuggesting(true);
		try {
			for (const raw of candidates) {
				const name = raw.replace(/[^a-z0-9_]/g, '').slice(0, 20);
				if (name.length < 3) continue;
				if (await checkUsernameAvailable(name)) {
					setFormData(prev => ({...prev, username: name}));
					setError(prev => ({...prev, username: ''}));
					setDebouncedUsername(name);
					return;
				}
			}
			Toast.show({
				type: 'error',
				text1: 'Could not find an available username',
				text2: 'Please try again or enter one manually.',
			});
		} finally {
			setSuggesting(false);
		}
	};

	const handleSubmit = async () => {
		try {
			const phoneDigits = String(formData.sPhone || '').replace(/\D/g, '');
			const email = String(formData.sEmail || '').trim();
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!email || !emailRegex.test(email)) {
				setError(prev => ({
					...prev,
					sEmail: 'Please enter a valid email address',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid email address',
					text2: 'Please enter a valid email (e.g. user@example.com).',
				});
				return;
			}
			const localWithZero = `0${phoneDigits}`;
			const validPrefixes = [
				// MTN
				'0703',
				'0704',
				'0706',
				'0803',
				'0806',
				'0810',
				'0813',
				'0814',
				'0816',

				// Glo
				'0705',
				'0805',
				'0807',
				'0811',
				'0815',
				'0817',
				// Airtel
				'090',
				'0701',
				'0708',
				'0802',
				'0808',
				'0812',

				// T2mobile (formerly 9mobile, common prefixes)
				'0909',
				'0809',
			];

			const hasValidPrefix = validPrefixes.some(prefix =>
				localWithZero.startsWith(prefix),
			);

			if (!hasValidPrefix) {
				setError(prev => ({
					...prev,
					sPhone: 'Phone number not valid',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid phone prefix',
					text2: 'Phone number not valid',
				});
				return;
			}
			if (!phoneDigits || phoneDigits.length !== 10) {
				setError(prev => ({...prev, sPhone: 'Phone number must be 10 digits'}));
				Toast.show({
					type: 'error',
					text1: 'Invalid phone number',
					text2:
						'Please enter a valid 10-digit phone number (without country code).',
				});
				return;
			}
			const password = String(formData.password || '').trim();
			const confirm = String(formData.password_confirmation || '').trim();

			// Password presence and length check
			if (!password || password.length < 8) {
				setError(prev => ({
					...prev,
					password: 'Password must be at least 8 characters',
				}));
				Toast.show({
					type: 'error',
					text1: 'Invalid password',
					text2: 'Password must be at least 8 characters long.',
				});
				return;
			}

			// Confirm password presence
			if (!confirm) {
				setError(prev => ({
					...prev,
					password_confirmation: 'Please confirm your password',
				}));
				Toast.show({
					type: 'error',
					text1: 'Confirm password required',
					text2: 'Please enter the same password in the confirmation field.',
				});
				return;
			}

			// Match check
			if (password !== confirm) {
				setError(prev => ({
					...prev,
					password_confirmation: 'Passwords do not match',
				}));
				Toast.show({
					type: 'error',
					text1: 'Passwords do not match',
					text2: 'Please make sure both password fields are identical.',
				});
				return;
			}

			// clear password errors when valid
			setError(prev => ({...prev, password: '', password_confirmation: ''}));

			// The PIN is collected on the dedicated SetPin page, which then calls
			// /register with the real pin. Carry the validated form data across.
			router.navigate({
				pathname: '/SetPin',
				params: {
					data: JSON.stringify({...formData, sPhone: `234${phoneDigits}`}),
				},
			});
		} catch (err: any) {
			Toast.show({
				type: 'error',
				text1: 'Registration Error',
				text2: err.response?.data?.message || err.message,
			});
			console.log(
				err.response?.data.errors || err.response?.data || err.message,
			);

			if (err.response?.data?.errors) {
				setError(err.response.data?.errors);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<ScrollView className="bg-white flex-1 px-[3%] py-5 pb-28">
			<KeyboardAvoidingView>
				<Logo />
				<Text className="text-4xl mt-10 mb-2 font-bold">
					Create your account
				</Text>
				<Text className="text-[#222222] text-xl">
					To get started with more features
				</Text>

				<View className="mt-10 mb-20 gap-y-3">
					<View className="">
						<Text className="text-xl font-semibold">First Name</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									fname: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									fname: '',
								}));
							}}
							value={formData.fname.replace(/[<>"'&/]/g, '')}
						/>
						{error.fname ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">{error.fname}</Text>
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Last Name</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									lname: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									lname: '',
								}));
							}}
							value={formData.lname.replace(/[<>"'&/]/g, '')}
						/>
						{error.lname ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">{error.lname}</Text>
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Username</Text>
						<View className="relative">
							<TextInput
								className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 pr-14 h-14 text-black"
								onChangeText={text => {
									setFormData(prev => ({
										...prev,
										username: text.replace(/[^a-zA-Z0-9_]/g, ''),
									}));
									setError(prev => ({
										...prev,
										username: '',
									}));
								}}
								value={formData.username}
								autoCapitalize="none"
								autoCorrect={false}
							/>
							<View className="absolute right-4 top-1/2 -translate-y-1/2">
								<TouchableOpacity
									onPress={suggestUsername}
									disabled={suggesting}
									hitSlop={8}
								>
									{suggesting ? (
										<ActivityIndicator size="small" color="#1A73E8" />
									) : (
										<MaterialCommunityIcons
											name="auto-fix"
											size={24}
											color="#1A73E8"
										/>
									)}
								</TouchableOpacity>
							</View>
						</View>
						{usernameChecking ||
						usernameAvailable === true ||
						usernameAvailable === false ||
						error.username ? (
							<View className="ml-1">
								{usernameChecking ? (
									<Text className="text-[#888] text-sm">
										Checking availability…
									</Text>
								) : usernameAvailable === true ? (
									<Text className="text-[#1F9254] text-sm">
										✓ Username is available
									</Text>
								) : usernameAvailable === false ? (
									<Text className="text-red-500 text-sm">
										Username is already taken
									</Text>
								) : (
									<Text className="text-red-500 text-sm">{error.username}</Text>
								)}
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Email address</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									sEmail: text.replace(/[<>"'&/]/g, ''),
								}));
								setError(prev => ({
									...prev,
									sEmail: '',
								}));
							}}
							value={formData.sEmail.replace(/[<>"'&/]/g, '')}
							inputMode="email"
						/>
						{error.sEmail ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">{error.sEmail}</Text>
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Phone Number</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text => {
								setFormData(prev => ({
									...prev,
									sPhone: text
										.replace(/[<>"'&/]/g, '')
										.replace('+234', '')
										.replace('+23', '')
										.replace('+2', '')
										.replace('+', ''),
								}));
								setError(prev => ({
									...prev,
									sPhone: '',
								}));
							}}
							value={`+234${formData.sPhone.replace(/[<>"'&/]/g, '')}`}
							inputMode="tel"
							maxLength={14}
						/>
						{error.sPhone ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">{error.sPhone}</Text>
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Password</Text>
						<View className="relative">
							<TextInput
								className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
								onChangeText={text => {
									setFormData(prev => ({
										...prev,
										password: text.replace(/[<>"'&/]/g, ''),
									}));
									setError(prev => ({
										...prev,
										password: '',
									}));
								}}
								value={formData.password.replace(/[<>"'&/]/g, '')}
								secureTextEntry={!showPassword}
							/>
							<View className="absolute right-5 top-1/2 -translate-y-1/2">
								{/* <EyeIcon /> */}
								<TouchableOpacity
									onPress={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<AntDesign name="eye" size={24} color="#C8C8C8" />
									) : (
										<AntDesign name="eye-invisible" size={24} color="#C8C8C8" />
									)}
								</TouchableOpacity>
							</View>
						</View>
						{error.password ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">{error.password}</Text>
							</View>
						) : null}

						{/* Live password requirements */}
						{formData.password.length > 0 && (
							<View className="bg-[#EEF4FF] rounded-xl p-4 mt-1 gap-y-2">
								<Text className="text-[#111] font-semibold text-sm mb-1">
									Password requirements:
								</Text>
								{passwordRequirements.map(req => (
									<View
										key={req.label}
										className="flex-row items-center gap-x-2"
									>
										<Ionicons
											name={req.met ? 'checkmark-circle' : 'ellipse-outline'}
											size={16}
											color={req.met ? '#1F9254' : '#9AA5B4'}
										/>
										<Text
											className={`text-sm flex-1 ${
												req.met ? 'text-[#1F9254]' : 'text-[#64748B]'
											}`}
										>
											{req.label}
										</Text>
									</View>
								))}
							</View>
						)}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">Confirm Password</Text>
						<View className="relative">
							<TextInput
								className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
								onChangeText={text => {
									setFormData(prev => ({
										...prev,
										password_confirmation: text.replace(/[<>"'&/]/g, ''),
									}));
									setError(prev => ({
										...prev,
										password: '',
									}));
								}}
								value={formData.password_confirmation.replace(/[<>"'&/]/g, '')}
								secureTextEntry={!showConfirmPassword}
							/>
							<View className="absolute right-5 top-1/2 -translate-y-1/2">
								{/* <EyeIcon /> */}
								<TouchableOpacity
									onPress={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<AntDesign name="eye" size={24} color="#C8C8C8" />
									) : (
										<AntDesign name="eye-invisible" size={24} color="#C8C8C8" />
									)}
								</TouchableOpacity>
							</View>
						</View>
						{error.password_confirmation ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">
									{error.password_confirmation}
								</Text>
							</View>
						) : formData.password_confirmation.length > 0 && !passwordsMatch ? (
							<View className="ml-1">
								<Text className="text-red-500 text-sm">
									Passwords do not match
								</Text>
							</View>
						) : null}
					</View>
					<View className="">
						<Text className="text-xl font-semibold">
							Referral code{' '}
							<Text className="text-[#888] text-base font-normal">
								(optional)
							</Text>
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full mt-3 mb-2 rounded-lg px-5 h-14 text-black"
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									referral: text.replace(/[^a-zA-Z0-9]/g, ''),
								}))
							}
							value={formData.referral}
							autoCapitalize="none"
							autoCorrect={false}
							placeholder="Enter referral code"
						/>
					</View>
				</View>
				<View className="mb-60">
					<Button
						title="Sign up"
						onPress={handleSubmit}
						disabled={!isFormValid}
					/>
					<View className="flex-row justify-center items-center mt-5">
						<Text className="text-xl">Don&apos;t have an account? </Text>

						<TouchableOpacity onPress={() => router.navigate('/Signin')}>
							<Text className="text-primary text-2xl font-bold">Sign in </Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScrollView>
	);
};

export default Signup;
