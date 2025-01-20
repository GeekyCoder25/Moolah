import {Image, ScrollView, TextInput, View} from 'react-native';
import React, {useState} from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';
import {useGlobalStore} from '@/context/store';
import Button from './components/button';

const Profile = () => {
	const {} = useGlobalStore();
	const [formData, setFormData] = useState({
		first_name: '',
		email: '',
		phone_number: '',
		state: '',
	});

	const first_name = 'Toyyib';
	const email = 'toyibe25@gmail.com';

	const handleUpdate = () => {};

	return (
		<View className="flex-1 px-[5%] py-5">
			<ScrollView className="gap-x-4 flex-1">
				<Back title="Profile" />

				<View className="justify-center items-center my-10 gap-y-5">
					<Image
						source={{
							uri: 'https://avatars.githubusercontent.com/u/96173120',
						}}
						className="w-52 h-52 rounded-full"
					/>
					<View className="items-center">
						<Text className="text-2xl" fontWeight={600}>
							{first_name}
						</Text>
						<Text className="text-xl">{email}</Text>
					</View>

					<View className="w-full mt-10">
						<Text className="text-secondary text-xl" fontWeight={600}>
							Account Details
						</Text>

						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								Name
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
								placeholder="Name"
								placeholderTextColor={'#7D7D7D'}
								onChangeText={text =>
									setFormData(prev => {
										return {
											...prev,
											first_name: text,
										};
									})
								}
								value={formData.first_name}
							/>
						</View>
						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								Email address
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
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
							/>
						</View>
						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								Phone number
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
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
							/>
						</View>
						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								State
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
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
