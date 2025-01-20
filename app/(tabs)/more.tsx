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

type RoutePaths =
	| '/Profile'
	| '/AccountSettings'
	| '/Referral'
	| '/Contact'
	| '/Card'
	| '/';

const More = () => {
	const {} = useGlobalStore();
	const name = 'Toyyib Lawal';
	const routes: {
		title: string;
		subText: string;
		icon: React.JSX.Element;
		route: RoutePaths;
	}[] = [
		{
			title: name,
			subText: 'Your profile',
			icon: <FontAwesome name="user" size={24} color="white" />,
			route: '/Profile',
		},
		{
			title: 'Account setting',
			subText: 'Your profile',
			icon: <MaterialIcons name="settings" size={24} color="white" />,
			route: '/AccountSettings',
		},
		{
			title: 'Referral ',
			subText: 'Your profile',
			icon: <FontAwesome5 name="user-friends" size={24} color="white" />,
			route: '/Referral',
		},
		{
			title: 'Contact us ',
			subText: 'Your profile',
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
			subText: 'Your profile',
			icon: <Ionicons name="card" size={24} color="white" />,
			route: '/Card',
		},
		{
			title: 'Log out',
			subText: 'Your profile',
			icon: <AntDesign name="logout" size={24} color="white" />,
			route: '/',
		},
	];

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
								? router.replace('/Signin')
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
