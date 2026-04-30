import BackIcon from '@/assets/icons/back-icon';
import Back from '@/components/back';
import {Text} from '@/components/text';
import {useGlobalStore} from '@/context/store';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from 'expo-router';
import React from 'react';
import {Linking, Platform, ScrollView, TouchableOpacity, View} from 'react-native';

import {ACCESS_TOKEN_KEY, IS_LOGGED_IN} from '@/constants';
import {MemoryStorage} from '@/utils/storage';

type RoutePaths =
	| '/Profile'
	| '/AccountSettings'
	| '/Referral'
	| '/Contact'
	| '/Card'
	| '/';

const More = () => {
	const {user, setAccessToken, settings} = useGlobalStore();
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

	const socials: {key: keyof NonNullable<typeof settings>; icon: string}[] = [
		{key: 'facebook', icon: 'facebook'},
		{key: 'twitter', icon: 'x-twitter'},
		{key: 'instagram', icon: 'instagram'},
		{key: 'telegram', icon: 'telegram'},
		{key: 'whatsapp_group', icon: 'whatsapp'},
	];

	const openExternal = (url?: string | null) => {
		if (!url) return;
		const trimmed = url.trim();
		if (!trimmed) return;
		Linking.openURL(trimmed);
	};

	const openStore = () => {
		const url =
			Platform.OS === 'ios' ? settings?.apple_app_url : settings?.google_play_url;
		openExternal(url);
	};

	const storeUrl =
		Platform.OS === 'ios' ? settings?.apple_app_url : settings?.google_play_url;

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

			<View className="gap-y-5 mt-20">
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

			{(settings?.terms || settings?.privacy || settings?.about) && (
				<View className="bg-white rounded-xl mt-8 px-5 py-2">
					{settings?.about && (
						<TouchableOpacity
							className="py-4 border-b border-[#F0F0F0]"
							onPress={() => openExternal(settings.about)}
						>
							<Text className="text-base">About</Text>
						</TouchableOpacity>
					)}
					{settings?.terms && (
						<TouchableOpacity
							className="py-4 border-b border-[#F0F0F0]"
							onPress={() => openExternal(settings.terms)}
						>
							<Text className="text-base">Terms of Service</Text>
						</TouchableOpacity>
					)}
					{settings?.privacy && (
						<TouchableOpacity
							className="py-4"
							onPress={() => openExternal(settings.privacy)}
						>
							<Text className="text-base">Privacy Policy</Text>
						</TouchableOpacity>
					)}
				</View>
			)}

			{storeUrl ? (
				<TouchableOpacity
					className="bg-secondary rounded-xl py-4 mt-6 items-center"
					onPress={openStore}
				>
					<Text className="text-white text-base font-semibold">
						Rate Paxi on the {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
					</Text>
				</TouchableOpacity>
			) : null}

			{socials.some(s => settings?.[s.key]) && (
				<View className="flex-row justify-center gap-x-6 mt-8 mb-10">
					{socials.map(s => {
						const url = settings?.[s.key] as string | undefined;
						if (!url || !url.trim()) return null;
						return (
							<TouchableOpacity
								key={s.key}
								onPress={() => openExternal(url)}
								className="w-12 h-12 rounded-full bg-secondary items-center justify-center"
							>
								<FontAwesome6
									name={s.icon as any}
									size={20}
									color="white"
								/>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</ScrollView>
	);
};

export default More;
