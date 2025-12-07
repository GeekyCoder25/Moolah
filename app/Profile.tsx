import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import {GlobalColors} from '@/styles';
import {AxiosClient} from '@/utils/axios';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, {useState} from 'react';
import {ScrollView, TextInput, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {UserResponse} from '../types';
import Button from './components/button';

const Profile = () => {
	const {setLoading, user, setUser} = useGlobalStore();
	const [formData, setFormData] = useState({
		fname: user?.firstname || '',
		lname: user?.lastname || '',
		email: user?.email || '',
		phone_number: user?.phone_number || '',
		state: user?.state || '',
	});

	if (!user) return null;
	const {email, firstname, lastname} = user;

	const handleUpdate = async () => {
		try {
			setLoading(true);
			const axiosClient = new AxiosClient();

			const response = await axiosClient.put<any, UserResponse>(
				'/user/1',
				formData
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

				<View className="justify-center items-center my-10 gap-y-5">
					{/* <Image
						source={{
							uri: 'https://avatars.githubusercontent.com/u/96173120',
						}}
						className="w-52 h-52 rounded-full"
					/> */}
					<FontAwesome name="user" size={100} color={GlobalColors.secondary} />
					<View className="items-center">
						<Text className="text-2xl" fontWeight={600}>
							{firstname} {lastname}
						</Text>
						<Text className="text-xl">{email}</Text>
					</View>

					<View className="w-full mt-10">
						<Text className="text-secondary text-xl" fontWeight={600}>
							Account Details
						</Text>

						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								First name
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
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
						<View className="my-5">
							<Text className="text-xl" fontWeight={600}>
								Last name
							</Text>
							<TextInput
								className="border-[1px] border-[#C8C8C8] mt-2 p-5 rounded-xl h-14"
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
								editable={false}
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
								editable={false}
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
