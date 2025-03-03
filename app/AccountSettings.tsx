import {TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Text} from '@/components/text';
import Back from '@/components/back';
import {router} from 'expo-router';
import BackIcon from '@/assets/icons/back-icon';
import LockIcon from '@/assets/icons/lock';
import LockChangeIcon from '@/assets/icons/lock-change';
import LockSlashIcon from '@/assets/icons/lock-slash';

const AccountSettings = () => {
	type RoutePaths = '/ChangePassword' | '/ChangePin' | '/DisablePin';
	const routes: {
		title: string;
		subText: string;
		icon: React.JSX.Element;
		route: RoutePaths;
	}[] = [
		{
			title: 'Change Password',
			subText: 'Update your account password',
			icon: <LockIcon />,
			route: '/ChangePassword',
		},
		{
			title: 'Change pin',
			subText: 'Modify your security PIN',
			icon: <LockChangeIcon />,
			route: '/ChangePin',
		},
		{
			title: 'Disable pin',
			subText: 'Temporarily disable your PIN security',
			icon: <LockSlashIcon />,
			route: '/DisablePin',
		},
	];

	return (
		<View className="px-[5%] py-5 gap-x-4 flex-1">
			<Back title="Account settings" />
			<View className="gap-y-5 my-20">
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

export default AccountSettings;
