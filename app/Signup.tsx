import {Text} from '@/components/text';
import {
	KeyboardAvoidingView,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import React, {useState} from 'react';
import Logo from '@/assets/icons/logo';
import {router} from 'expo-router';
import {ScrollView} from 'react-native';
import Button from './components/button';
import {AxiosClient} from '@/utils/axios';
import Toast from 'react-native-toast-message';
import {useGlobalStore} from '@/context/store';

const Signup = () => {
	const {setLoading} = useGlobalStore();
	const [formData, setFormData] = useState({
		fname: '',
		lname: '',
		email: '',
		phone: '',
		password: '',
		password_confirmation: '',
		referral: '',
	});

	const handleSubmit = async () => {
		try {
			const axiosClient = new AxiosClient();
			setLoading(true);
			const response = await axiosClient.post('/register', formData);
			if (response.status === 200) {
				router.navigate('/SetPin');
			}
		} catch (error: any) {
			Toast.show({
				type: 'error',
				text1: 'Registration Error',
				text2: error.response?.data || error.message,
			});
			console.log(error.response?.data || error.message);
		} finally {
			router.navigate('/SetPin');
			setLoading(false);
		}
	};

	return (
		<ScrollView className="bg-white flex-1 px-[3%] py-5">
			<KeyboardAvoidingView>
				<Logo />
				<Text className="text-4xl mt-10 mb-2" fontWeight={700}>
					Create your account
				</Text>
				<Text className="text-[#222222] text-xl">
					To get started with more features
				</Text>

				<View className="my-20 gap-y-5">
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							First Name
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, fname: text}))
							}
							value={formData.fname}
						/>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Last Name
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, lname: text}))
							}
							value={formData.lname}
						/>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Email address
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, email: text}))
							}
							value={formData.email}
						/>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Phone Number
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, phone: text}))
							}
							value={formData.phone}
							inputMode="tel"
							maxLength={11}
						/>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Password
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, password: text}))
							}
							value={formData.password}
							secureTextEntry
						/>
					</View>
					<View className="">
						<Text className="text-xl" fontWeight={600}>
							Confirm Password
						</Text>
						<TextInput
							className="bg-white border-[1px] border-[#C8C8C8] w-full my-3 rounded-lg px-5 h-14"
							onChangeText={text =>
								setFormData(prev => ({...prev, password_confirmation: text}))
							}
							value={formData.password_confirmation}
							secureTextEntry
						/>
					</View>
				</View>
				<View className="mb-20">
					<Button title="Sign up" onPress={handleSubmit} />
					<View className="flex-row justify-center items-center mt-5">
						<Text className="text-xl">Don't have an account? </Text>

						<TouchableOpacity onPress={() => router.navigate('/Signin')}>
							<Text className="text-primary text-2xl" fontWeight={700}>
								Sign in{' '}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</ScrollView>
	);
};

export default Signup;
