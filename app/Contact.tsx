import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';
import {router} from 'expo-router';
import LockSlashIcon from '@/assets/icons/lock-slash';
import BackIcon from '@/assets/icons/back-icon';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const Contact = () => {
	type RoutePaths = '/Message' | '/Contact';
	const routes: {
		title: string;
		subText: string;
		icon: React.JSX.Element;
		route: RoutePaths;
	}[] = [
		{
			title: 'Send direct message',
			subText: 'Your profile',
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
			subText: 'Your profile',
			icon: <FontAwesome6 name="phone-volume" size={24} color="white" />,
			route: '/Contact',
		},
		{
			title: 'Send a mail',
			subText: 'Your profile',
			icon: <LockSlashIcon />,
			route: '/Contact',
		},
		{
			title: 'Whatsapp',
			subText: 'Your profile',
			icon: <LockSlashIcon />,
			route: '/Contact',
		},
		{
			title: 'Whatsapp group',
			subText: 'Your profile',
			icon: <LockSlashIcon />,
			route: '/Contact',
		},
		{
			title: 'Facebook',
			subText: 'Your profile',
			icon: <LockSlashIcon />,
			route: '/Contact',
		},
	];

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
						onPress={() => router.navigate(route.route)}
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
