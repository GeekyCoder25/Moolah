import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import Back from '@/components/back';
import ProfileIcon from '@/assets/icons/profile';
import {Text} from '@/components/text';
import BackIcon from '@/assets/icons/back-icon';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {useGlobalStore} from '@/context/store';
import {router} from 'expo-router';
import {ScrollView} from 'react-native';
import {MemoryStorage} from '@/utils/storage';
import {ACCESS_TOKEN_KEY, IS_LOGGED_IN} from '@/constants';

type RoutePaths =
	| '/Profile'
	| '/AccountSettings'
	| '/Referral'
	| '/Contact'
	| '/Card'
	| '/';

const More = () => {
	const {user, setAccessToken} = useGlobalStore();
	const name = `${user?.firstname} ${user?.lastname}`;
	const routes: {
		title: string;
		subText: string;
		icon: React.JSX.Element;
		route: RoutePaths;
	}[] = [
		{
			title: name,
			subText: 'View and edit your profile details',
			icon: <FontAwesome name="user" size={24} color="white" />,
			route: '/Profile',
		},
		{
			title: 'Account setting',
			subText: 'Manage your account preferences',
			icon: <MaterialIcons name="settings" size={24} color="white" />,
			route: '/AccountSettings',
		},
		{
			title: 'Referral ',
			subText: 'Invite friends and earn rewards',
			icon: <FontAwesome5 name="user-friends" size={24} color="white" />,
			route: '/Referral',
		},
		{
			title: 'Contact us ',
			subText: 'Reach out to our support team',
			icon: (
				<MaterialCommunityIcons
					name="message-question"
					size={24}
					color="white"
				/>
			),
			route: '/Contact',
		},
		{
			title: 'Credit cards',
			subText: 'View and manage your linked cards',
			icon: <Ionicons name="card" size={24} color="white" />,
			route: '/Card',
		},
		{
			title: 'Log out',
			subText: 'Sign out of your account',
			icon: <AntDesign name="logout" size={24} color="white" />,
			route: '/',
		},
	];

	const handleLogout = async () => {
		const storage = new MemoryStorage();
		await storage.removeItem(IS_LOGGED_IN);
		await storage.removeItem(ACCESS_TOKEN_KEY);
		setAccessToken('');
		router.replace('/Signin');
	};

	return (
		<ScrollView className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="More" />

			<View className="gap-y-5 my-20">
				{routes.map((route, index) => (
					<TouchableOpacity
						key={route.title}
						className={`bg-white px-3 py-5 flex-row items-center gap-x-5 rounded-xl ${
							index ? '' : 'mb-7'
						}`}
						onPress={() =>
							index === routes.length - 1
								? handleLogout()
								: router.navigate(route.route)
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
		</ScrollView>
	);
};

export default More;
