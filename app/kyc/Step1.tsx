import AlbumIcon from '@/assets/icons/album';
import BackIcon from '@/assets/icons/back-icon';
import ChevronRightIcon from '@/assets/icons/chevron-right';
import Logo from '@/assets/icons/logo';
import ProfileCardIcon from '@/assets/icons/profile-card';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from 'expo-router';
import React from 'react';
import {Pressable, ToastAndroid, TouchableOpacity, View} from 'react-native';

const Step1 = () => {
	const {nin} = useGlobalStore();

	return (
		<View className="bg-white px-[5%] pt-5 pb-10 flex-1">
			<Pressable
				className="flex-row items-center gap-x-4 mb-5"
				onPress={router.back}
			>
				<BackIcon />
			</Pressable>

			<Logo />

			<View className="my-10">
				<Text className="text-3xl font-bold">
					Verify your identity with KYC
				</Text>
				<Text className="text-[#222222] mt-2 rounded-tl-2xl">
					Input your NIN to verify your identity
				</Text>
			</View>

			<View className="gap-y-10">
				<TouchableOpacity
					className="flex-row gap-5 items-center pr-5"
					onPress={() => router.push('/kyc/Step2')}
				>
					<View className="bg-secondary p-3 w-14 h-14 rounded-full justify-center items-center">
						<ProfileCardIcon color={'#FFFFFF'} width={26} height={19} />
					</View>
					<View className="flex-1">
						<Text className="text-xl font-semibold">
							Input your nin to verify ID
						</Text>
					</View>
					{nin ? (
						<Ionicons
							name="checkmark-circle-sharp"
							size={24}
							color={'#0D6EFD'}
						/>
					) : (
						<ChevronRightIcon />
					)}
				</TouchableOpacity>
				<TouchableOpacity
					className="flex-row gap-5 items-center pr-5"
					onPress={() =>
						!nin
							? ToastAndroid.show('Please provide your NIN first', 2000)
							: router.push('/kyc/Step3')
					}
				>
					<View className="bg-secondary p-3 w-14 h-14 rounded-full justify-center items-center">
						<AlbumIcon color={'#FFFFFF'} />
					</View>
					<View className="flex-1">
						<Text className="text-xl font-semibold">
							Take a selfie to verify your nin
						</Text>
					</View>

					<ChevronRightIcon />
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default Step1;
