import {
	Modal,
	Pressable,
	ScrollView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Back from '@/components/back';
import {Text} from '@/components/text';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {globalStyles} from '@/styles';
import Button from './components/button';
import InfoIcon from '@/assets/icons/info-icon';

const TV = () => {
	const [formData, setFormData] = useState({
		provider: '',
		type: '',
		plan: '',
		meter_number: '',
	});
	const [showProviderModal, setShowProviderModal] = useState(false);
	const [showPlanModal, setShowPlanModal] = useState(false);
	const [showTypeModal, setShowTypeModal] = useState(false);

	const providers = [
		{
			label: 'DSTV',
		},
		{
			label: 'GOTV',
		},
		{
			label: 'Startimes',
		},
	];

	const plans = [
		{
			label: 'Weekly',
		},
		{
			label: 'Monthly',
		},
	];
	const types = [
		{
			label: '₦2000',
		},
		{
			label: '₦1500',
		},
	];

	const handleBuy = async () => {
		try {
			if (!formData.provider) {
				throw new Error('Please select a provider');
			} else if (!formData.meter_number) {
				throw new Error('Please input your decoder number ');
			} else if (!formData.plan) {
				throw new Error('Please select a subscription plan');
			}
		} catch (error: any) {
			alert(error.message);
		} finally {
		}
	};

	return (
		<ScrollView className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="TV" />
			<View className="flex-1">
				<View className="my-10">
					<Text className="text-3xl" fontWeight={600}>
						Cable TV
					</Text>
					<Text className="text-secondary mt-2 rounded-tl-2xl">
						Cable tv subscription
					</Text>
				</View>
				<View className="mb-10 bg-[#dee8f6] px-10 py-5 rounded-xl gap-y-5">
					<View className="flex-row items-center">
						<Text className="text-secondary">
							Note{' '}
							<View className="mt-5">
								<InfoIcon />
							</View>
						</Text>
					</View>
					<Text>
						You can contact DSTV/GOtv's customers care unit on
						01-2703232/08039003788 or the toll free lines: 08149860333,
						07080630333, and 09090630333 for assistance. STARTIMES's customers
						care unit on (094618888, 014618888)
					</Text>
				</View>

				<View className="gap-y-5">
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Provider
							</Text>
							<TouchableOpacity
								onPress={() => setShowProviderModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.provider || 'Select Provider'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showProviderModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowProviderModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Provider
										</Text>
										<View className="my-10">
											{providers.map(provider => (
												<TouchableOpacity
													key={provider.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															provider: provider.label,
														}));
														setShowProviderModal(false);
													}}
												>
													<Text className="text-2xl">{provider.label}</Text>
												</TouchableOpacity>
											))}
										</View>
									</View>
								</View>
							</Modal>
						)}
					</View>
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Plan
							</Text>
							<TouchableOpacity
								onPress={() => setShowPlanModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.plan || 'Select subscription plan'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showPlanModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowPlanModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Meter Type
										</Text>
										<View className="my-10">
											{plans.map(plan => (
												<TouchableOpacity
													key={plan.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															plan: plan.label,
														}));
														setShowPlanModal(false);
													}}
												>
													<Text className="text-2xl">{plan.label}</Text>
												</TouchableOpacity>
											))}
										</View>
									</View>
								</View>
							</Modal>
						)}
					</View>
					<View>
						<View className="gap-y-5">
							<Text className="text-xl" fontWeight={700}>
								Subscription Type
							</Text>
							<TouchableOpacity
								onPress={() => setShowTypeModal(true)}
								className="border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							>
								<Text className="text-lg">
									{formData.type || 'Select subscription type'}
								</Text>

								<FontAwesome name="caret-down" size={24} color="#7D7D7D" />
							</TouchableOpacity>
						</View>
						{showTypeModal && (
							<Modal transparent>
								<Pressable
									style={globalStyles.overlay}
									onPress={() => setShowTypeModal(false)}
								/>
								<View className="flex-1 justify-end items-end">
									<View className="bg-white w-full h-[70%] py-8 px-[5%] rounded-t-2xl">
										<Text className="text-3xl" fontWeight={700}>
											Select Meter Type
										</Text>
										<View className="my-10">
											{types.map(type => (
												<TouchableOpacity
													key={type.label}
													className="py-5"
													onPress={() => {
														setFormData(prev => ({
															...prev,
															type: type.label,
														}));
														setShowTypeModal(false);
													}}
												>
													<Text className="text-2xl">{type.label}</Text>
												</TouchableOpacity>
											))}
										</View>
									</View>
								</View>
							</Modal>
						)}
					</View>

					<View className="gap-y-5">
						<Text className="text-xl" fontWeight={700}>
							IUC Number
						</Text>

						<TextInput
							className="w-full border-[1px] border-[#C8C8C8] px-5 h-14 rounded-lg flex-row justify-between items-center"
							inputMode="numeric"
							value={formData.meter_number}
							onChangeText={text =>
								setFormData(prev => ({...prev, meter_number: text}))
							}
							placeholder="Decoder Number"
						/>
					</View>
				</View>
			</View>
			<View className="mt-10">
				<Button title="Buy" onPress={handleBuy} />
			</View>
		</ScrollView>
	);
};

export default TV;
