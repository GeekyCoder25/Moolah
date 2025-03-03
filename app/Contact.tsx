import {Linking, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';
import {router} from 'expo-router';
import LockSlashIcon from '@/assets/icons/lock-slash';
import BackIcon from '@/assets/icons/back-icon';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {AxiosClient} from '@/utils/axios';
import Fontisto from '@expo/vector-icons/Fontisto';
// Top-level API response interface
export interface ApiResponse {
	status: number;
	message: string;
	data: ContactData;
}

// Interface for the data property containing contact information
export interface ContactData {
	phone_number: string;
	email: string;
	whatsapp: string;
	whatsapp_group: string;
	facebook: string;
}

const Contact = () => {
	const [fields, setFields] = useState<ContactData | null>(null);
	const routes: {
		title: string;
		subText: string;
		icon: React.JSX.Element;
		route: string;
	}[] = [
		{
			title: 'Send direct message',
			subText: 'Chat with us instantly',
			icon: (
				<MaterialCommunityIcons
					name="message-reply-text"
					size={24}
					color="white"
				/>
			),
			route: '/Message',
		},
		{
			title: 'Call us',
			subText: 'Reach us via phone',
			icon: <FontAwesome6 name="phone-volume" size={24} color="white" />,
			route: `tel:${fields?.phone_number}`,
		},
		{
			title: 'Send a mail',
			subText: 'Email us your inquiries',
			icon: <Fontisto name="email" size={24} color="white" />,
			route: `mailto:${fields?.email}`,
		},
		{
			title: 'Whatsapp',
			subText: 'Start a WhatsApp chat',
			icon: <FontAwesome6 name="whatsapp" size={24} color="white" />,
			route: `https://wa.me/${fields?.whatsapp}`,
		},
		{
			title: 'Whatsapp group',
			subText: 'Join our WhatsApp community',
			icon: <FontAwesome6 name="whatsapp" size={24} color="white" />,
			route: `${fields?.whatsapp_group}`,
		},
		{
			title: 'Facebook',
			subText: 'Visit our Facebook page',
			icon: <FontAwesome6 name="facebook" size={24} color="white" />,
			route: `${fields?.facebook}`,
		},
	];

	useEffect(() => {
		const getProviders = async () => {
			try {
				const axiosClient = new AxiosClient();

				const response = await axiosClient.get<ApiResponse>('/support');

				if (response.status === 200) {
					setFields(response.data.data);
				}
			} catch (error) {}
		};
		getProviders();
	}, []);

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Contact us" />
			<View className="gap-y-5 my-10">
				{routes.map(route => (
					<TouchableOpacity
						key={route.title}
						className={
							'bg-white px-3 py-5 flex-row items-center gap-x-5 rounded-xl '
						}
						onPress={() =>
							route.route.startsWith('/')
								? router.navigate(route.route as '/Message')
								: Linking.openURL(route.route)
						}
					>
						<View className="bg-secondary w-14 h-14 rounded-full justify-center items-center">
							{route.icon}
						</View>
						<View className="flex-1">
							<Text className="text-2xl">{route.title}</Text>
							<Text>{route.subText}</Text>
						</View>
						<View className="rotate-180">
							<BackIcon />
						</View>
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};

export default Contact;
