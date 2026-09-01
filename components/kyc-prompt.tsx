import {Text} from '@/components/text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {Modal, Pressable, TouchableOpacity, View} from 'react-native';

interface Props {
	visible: boolean;
	onVerify: () => void;
	onLater: () => void;
	onDismissForever: () => void;
}

// Dismissible prompt shown on the home screen when the user hasn't completed
// KYC. "Don't show again" is persisted by the caller so it stops auto-showing.
const KycPrompt = ({visible, onVerify, onLater, onDismissForever}: Props) => {
	if (!visible) return null;
	return (
		<Modal transparent visible animationType="fade" onRequestClose={onLater}>
			<Pressable
				onPress={onLater}
				style={{
					flex: 1,
					backgroundColor: 'rgba(0,0,0,0.5)',
					justifyContent: 'center',
				}}
			>
				{/* Stop taps on the card from dismissing via the backdrop. */}
				<Pressable
					onPress={() => {}}
					style={{
						backgroundColor: '#fff',
						borderRadius: 24,
						padding: 24,
						marginHorizontal: 24,
					}}
				>
					<View className="w-16 h-16 rounded-full bg-[#E7F0FF] items-center justify-center self-center mb-4">
						<MaterialCommunityIcons
							name="shield-account-outline"
							size={32}
							color="#0D6EFD"
						/>
					</View>
					<Text className="text-xl font-bold text-center text-[#111]">
						Verify your identity
					</Text>
					<Text className="text-[#555] text-center mt-2 leading-5">
						Complete your KYC to unlock the app — fund your wallet, buy airtime
						& data, pay bills, and transfer money. Until you verify, these
						actions stay locked.
					</Text>

					<TouchableOpacity
						onPress={onVerify}
						className="bg-secondary rounded-xl py-4 mt-6 items-center"
					>
						<Text className="text-white font-bold text-base">Verify now</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={onLater}
						className="py-3 mt-1 items-center"
					>
						<Text className="text-secondary font-semibold">
							Remind me later
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={onDismissForever}
						className="py-2 items-center"
					>
						<Text className="text-[#999] text-sm">
							Don&apos;t show this again
						</Text>
					</TouchableOpacity>
				</Pressable>
			</Pressable>
		</Modal>
	);
};

export default KycPrompt;
