import {TextInput, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Back from '@/components/back';
import WalletBgIcon from '@/assets/icons/wallet-bg';
import {Text} from '@/components/text';
import Toast from 'react-native-toast-message';
import {useGlobalStore} from '@/context/store';
import * as Clipboard from 'expo-clipboard';

const Referral = () => {
	const {user} = useGlobalStore();
	const handleCopy = async () => {
		Toast.show({
			type: 'success',
			text1: 'Copied to clipboard',
			text2: user?.referral_link,
		});
		Clipboard.setStringAsync(user?.referral_link || '');
	};

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Referral" />
			<View className="bg-primary mt-7 p-7 gap-y-2 rounded-bl-xl rounded-tr-xl overflow-hidden">
				<View className="z-10 flex-row gap-x-10 justify-around">
					<View className="bg-white rounded-xl gap-y-3 py-5 w-36  justify-center items-center">
						<Text className="text-xl" fontWeight={600}>
							Referrals
						</Text>

						<Text className="bg-bold text-4xl" fontWeight={600}>
							0
						</Text>
					</View>
					<View className="bg-white rounded-xl gap-y-3 py-5 w-36 justify-center items-center">
						<Text className="text-xl" fontWeight={600}>
							Commission
						</Text>

						<Text className="bg-bold text-4xl" fontWeight={600}>
							{user?.referral_wallet_balance.toLocaleString()}
						</Text>
					</View>
				</View>
				<View className="bg-secondary w-12 h-12 rounded-full absolute -left-2 -top-2">
					<WalletBgIcon />
				</View>
				<View className="bg-secondary w-12 h-12 rounded-full absolute -right-2 -bottom-2" />
			</View>

			<View className="bg-white rounded-lg my-10 px-5 py-10">
				<Text className="text-xl" fontWeight={600}>
					Referral link
				</Text>

				<View className="border-[1px] border-[#C8C8C8] rounded-md mt-10 px-5 py-5">
					<Text className="text-[#7D7D7D] font-semibold">
						{user?.referral_link}
					</Text>
				</View>

				<View className="flex-row gap-x-5 mt-5">
					<TouchableOpacity
						onPress={handleCopy}
						className="bg-secondary px-5 py-4 w-32 rounded-xl"
					>
						<Text className="text-white text-center">Copy link</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={handleCopy}
						className="bg-secondary px-5 py-4 w-32 rounded-xl"
					>
						<Text className="text-white text-center">Withdraw</Text>
					</TouchableOpacity>
				</View>
			</View>
			<View className="bg-white rounded-lg mb-10 px-5 py-10">
				<Text className="text-xl" fontWeight={600}>
					Commission list
				</Text>
			</View>
		</View>
	);
};

export default Referral;
