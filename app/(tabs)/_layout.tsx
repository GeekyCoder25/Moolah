import {Tabs} from 'expo-router';
import React from 'react';
import {Platform} from 'react-native';
import TabBarBackground from '@/components/ui/TabBarBackground';
import {Colors} from '@/constants/Colors';
import {useColorScheme} from '@/hooks/useColorScheme';
import HomeIcon from '@/assets/icons/home';
import WifiIcon from '@/assets/icons/wifi';
import CallIcon from '@/assets/icons/call';
import MoreIcon from '@/assets/icons/more';

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				tabBarInactiveTintColor: '#7D7D7D',
				headerShown: false,
				tabBarStyle: Platform.select({
					default: {},
				}),
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({color}) => <HomeIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="data"
				options={{
					title: 'Data',
					tabBarIcon: ({color}) => <WifiIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="airtime"
				options={{
					title: 'Airtime',
					tabBarIcon: ({color}) => <CallIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="more"
				options={{
					title: 'More',
					tabBarIcon: ({color}) => <MoreIcon color={color} />,
				}}
			/>
		</Tabs>
	);
}
