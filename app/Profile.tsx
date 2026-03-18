import ProfileCardIcon from '@/assets/icons/profile-card';
import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useRouter} from 'expo-router';
import React, {useState} from 'react';
import {
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {UserResponse} from '../types';
import Button from './components/button';

const Profile = () => {
	const {setLoading, user, setUser} = useGlobalStore();
	const router = useRouter();
	const [showInfoBanner, setShowInfoBanner] = useState(true);
	const [formData, setFormData] = useState({
		fname: user?.firstname || '',
		lname: user?.lastname || '',
		email: user?.email || '',
		phone_number: user?.phone_number || '',
		state: user?.state || '',
	});

	if (!user) return null;
	const {email, firstname, lastname} = user;

	const completionFields = [
		!!user.firstname,
		!!user.lastname,
		!!user.email,
		!!user.phone_number,
		!!user.state,
		user.email_verified,
		user.mobile_verified,
		user.kyc_status === 'approved' || user.kyc_status === 'pending',
	];
	const completedCount = completionFields.filter(Boolean).length;
	const completionPct = Math.round(
		(completedCount / completionFields.length) * 100,
	);
	const kycIncomplete =
		user.kyc_status !== 'pending' && user.kyc_status !== 'approved';

	const handleUpdate = async () => {
		try {
			setLoading(true);
			const axiosClient = new AxiosClient();

			const response = await axiosClient.put<any, UserResponse>(
				'/user/1',
				formData,
			);
			if (response.status === 200) {
				setUser(response.data.data.attributes);
				Toast.show({
					type: 'success',
					text1: 'Success',
					text2: 'Profile updated successfully',
				});
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2:
					error.response?.data?.message ||
					error.response?.data ||
					error.message,
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<View className="flex-1 px-[5%] py-5">
			<ScrollView className="gap-x-4 flex-1">
				<Back title="Profile" />

				{/* Dismissable info banner */}
				{showInfoBanner && completionPct < 100 && (
					<View className="bg-[#EEF2FF] border border-[#C7D2FE] rounded-xl px-4 py-3 flex-row items-start gap-x-3 mb-4 mt-2">
						<View className="flex-1">
							<Text className="font-bold text-[#3730A3] text-sm">
								Complete your profile
							</Text>
							<Text className="text-[#4338CA] text-xs mt-0.5 leading-4">
								Your profile is {completionPct}% complete. Fill in missing
								details and verify your identity to unlock all features.
							</Text>
						</View>
						<Pressable onPress={() => setShowInfoBanner(false)} className="p-1">
							<Text className="text-[#4338CA] font-bold text-base">✕</Text>
						</Pressable>
					</View>
				)}

				<View className="justify-center items-center my-6 gap-y-5">
					<FontAwesome name="user" size={100} color={GlobalColors.secondary} />
					<View className="items-center">
						<Text className="text-2xl font-semibold">
							{firstname} {lastname}
						</Text>
						<Text className="text-xl">{email}</Text>
					</View>

					{/* Profile Completion Bar */}
					{completedCount !== completionFields.length && (
						<View className="w-full bg-white rounded-xl px-4 py-4 gap-y-2">
							<View className="flex-row justify-between items-center">
								<Text className="font-semibold text-base">
									Profile Completion
								</Text>
								<Text className="font-bold text-secondary text-base">
									{completionPct}%
								</Text>
							</View>
							<View className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
								<View
									className="h-full rounded-full bg-secondary"
									style={{width: `${completionPct}%`}}
								/>
							</View>
							<Text className="text-[#666] text-xs">
								{completedCount} of {completionFields.length} steps completed
							</Text>
						</View>
					)}

					{/* KYC Banner */}
					{kycIncomplete && (
						<View className="w-full bg-white rounded-xl px-4 py-3 flex-row items-center gap-x-3">
							<View className="w-14 h-14 bg-[#EEF2FF] rounded-xl items-center justify-center">
								<ProfileCardIcon />
							</View>
							<View className="flex-1">
								<Text className="font-bold text-[#111] text-sm">
									Verify your NIN
								</Text>
								<Text className="text-[#666] text-xs mt-0.5 leading-4">
									Complete identity verification to unlock all features.
								</Text>
							</View>
							<TouchableOpacity
								className="bg-[#0D1B4B] px-3 py-2 rounded-lg"
								onPress={() => router.navigate('/kyc/Step1')}
							>
								<Text className="text-white text-xs font-semibold">
									Verify NIN
								</Text>
							</TouchableOpacity>
						</View>
					)}

					<View className="w-full mt-5">
						<Text className="text-secondary text-xl font-semibold">
							Account Details
						</Text>

						<View className="mt-5">
							<Text className="text-xl font-semibold">First name</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl"
								placeholder="Name"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											fname: text,
										};
									})
								}
								value={formData.fname}
								editable={false}
							/>
						</View>
						<View className="mt-5">
							<Text className="text-xl font-semibold">Last name</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl"
								placeholder="Name"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											lname: text,
										};
									})
								}
								value={formData.lname}
								editable={false}
							/>
						</View>
						<View className="mt-5">
							<Text className="text-xl font-semibold">Email address</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl"
								placeholder="Email address"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											email: text,
										};
									})
								}
								value={formData.email}
								editable={false}
							/>
						</View>
						<View className="mt-5">
							<Text className="text-xl font-semibold">Phone number</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl"
								placeholder="Phone number"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											phone_number: text,
										};
									})
								}
								value={formData.phone_number}
								editable={false}
							/>
						</View>
						<View className="mt-5">
							<Text className="text-xl font-semibold">State</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl"
								placeholder="State"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											state: text,
										};
									})
								}
								value={formData.state}
								editable={false}
							/>
						</View>
					</View>
				</View>
			</ScrollView>

			<Button title="Update" onPress={handleUpdate} />
		</View>
	);
};

export default Profile;
