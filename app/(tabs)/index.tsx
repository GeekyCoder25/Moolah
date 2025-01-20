import Logo from '@/assets/icons/logo';
import {Text} from '@/components/text';
import {
	Image,
	StyleSheet,
	Platform,
	View,
	Pressable,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import {GlobalColors} from '@/styles';
import WalletBgIcon from '@/assets/icons/wallet-bg';
import WifiIcon from '@/assets/icons/wifi';
import CallIcon from '@/assets/icons/call';
import ElectricityIcon from '@/assets/icons/electricity';
import MonitorIcon from '@/assets/icons/monitor';
import GraduationCapIcon from '@/assets/icons/graduation';
import CameraIcon from '@/assets/icons/camera';
import {router} from 'expo-router';

export default function HomeScreen() {
	const walletAmount = 200000;

	return (
		<ScrollView className="flex-1 px-[3%]">
			<View className="bg-[#f5f5f5] py-5">
				<View className="flex-row">
					<Logo />
				</View>
				<View className="bg-primary mt-7 p-7 gap-y-2 rounded-bl-xl rounded-tr-xl overflow-hidden">
					<View className="z-10">
						<Text className="text-xl text-white" fontWeight={600}>
							Wallet Balance
						</Text>

						<Text className="text-white text-2xl" fontWeight={'bold'}>
							{walletAmount.toLocaleString()}
						</Text>
						<View className="flex-row gap-x-5 mt-5">
							<TouchableOpacity
								onPress={() => router.navigate('/Fund')}
								className="bg-white py-3 px-5 rounded-md flex-row items-center gap-x-2"
							>
								<Text className="text-secondary text-xl" fontWeight={600}>
									Fund Wallet
								</Text>
								<Entypo
									name="squared-plus"
									size={24}
									color={GlobalColors.secondary}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => router.navigate('/Transfer')}
								className="bg-white py-3 px-5 rounded-md flex-row items-center gap-x-2"
							>
								<Text className="text-secondary text-xl" fontWeight={600}>
									Wallet Transfer
								</Text>
								<Entypo
									name="wallet"
									size={24}
									color={GlobalColors.secondary}
								/>
							</TouchableOpacity>
						</View>
					</View>
					<View className="bg-secondary w-12 h-12 rounded-full absolute -left-2 -top-2">
						<WalletBgIcon />
					</View>
					<View className="bg-secondary w-12 h-12 rounded-full absolute -right-2 -bottom-2" />
				</View>
			</View>

			<View className="bg-white px-10 py-10 mt-5 rounded-xl gap-10 mb-10">
				<View className="flex-row justify-around flex-wrap gap-10 ">
					<Pressable
						onPress={() => router.navigate('/(tabs)/data')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<WifiIcon />
						<Text className="text-[#7D7D7D]">Data</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/(tabs)/airtime')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CallIcon />
						<Text className="text-[#7D7D7D]">Airtime</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/Electricity')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<ElectricityIcon />
						<Text className="text-[#7D7D7D]">Electricity</Text>
					</Pressable>
					<Pressable
						onPress={() => router.navigate('/Tv')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<MonitorIcon />
						<Text className="text-[#7D7D7D]">TV</Text>
					</Pressable>
					{/* </View> */}
					{/* <View className="flex-row justify-between  gap-10 mx-[10%]"> */}
					<Pressable
						onPress={() => router.navigate('/Exam')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<GraduationCapIcon />
						<Text className="text-[#7D7D7D]">Exam card</Text>
					</Pressable>

					<Pressable
						onPress={() => router.navigate('/')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CameraIcon />
						<Text className="text-[#7D7D7D]">Promote</Text>
					</Pressable>

					<Pressable
						onPress={() => router.navigate('/')}
						className="bg-[#e7f0ff] w-20 h-20 justify-center items-center rounded-xl gap-y-2"
					>
						<CameraIcon />
						<Text className="text-[#7D7D7D]">Authorize</Text>
					</Pressable>
				</View>
			</View>
			<View className="mt-10">
				<View className="flex flex-row justify-between items-center">
					<Text className="text-[#313131] text-2xl" fontWeight={600}>
						Recent Transaction
					</Text>

					<Text className="text-secondary text-lg" fontWeight={600}>
						See all
					</Text>
				</View>

				<View className="my-20 flex justify-center items-center">
					<Text className="text-center text-lg">
						You have no new transactions at the moment
					</Text>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
});
