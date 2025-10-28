import {
	Modal,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import Button from './components/button';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';

const DisablePin = () => {
	const [formData, setFormData] = useState({
		pin: '',
		status: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);

	const statuses = [
		{
			label: 'Enable',
		},
		{
			label: 'Disable',
		},
	];

	const handleChange = async () => {
		try {
		} catch (error: any) {
			alert(error.message);
		} finally {
		}
	};

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Disable pin" />
			<View className="flex-1">
				<View className="gap-y-5 my-10">
					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Pin
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							value={formData.pin}
							onChangeText={text =>
								setFormData(prev => ({
									...prev,
									pin: text.replace(/[<>"'&/]/g, ''),
								}))
							}
							placeholder="Pin"
							inputMode="numeric"
						/>
					</View>

					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={600}>
							Status
						</Text>
						<TouchableOpacity
							onPress={() => setShowProviderModal(true)}
							className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
						>
							<Text className="text-lg">
								{formData.status || 'Select status'}
							</Text>

							<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
						</TouchableOpacity>
					</View>
				</View>
			</View>
			{showProviderModal && (
				<Modal transparent>
					<Pressable
						style={globalStyles.overlay}
						onPress={() => setShowProviderModal(false)}
					/>
					<View className="flex-1 justify-end items-end">
						<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
							<Text className="text-2xl" fontWeight={700}>
								Select Meter Type
							</Text>
							<View className="my-5">
								{statuses.map(status => (
									<TouchableOpacity
										key={status.label}
										className="py-5"
										onPress={() => {
											setFormData(prev => ({
												...prev,
												status: status.label,
											}));
											setShowProviderModal(false);
										}}
									>
										<Text className="text-2xl">{status.label}</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>
					</View>
				</Modal>
			)}

			{formData.status && (
				<Button title={`${formData.status} Pin`} onPress={handleChange} />
			)}
		</View>
	);
};

export default DisablePin;
