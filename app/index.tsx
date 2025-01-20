import {router, useFocusEffect} from 'expo-router';
import React, {useEffect} from 'react';
import {Image, View} from 'react-native';

const Splash = () => {
	useFocusEffect(() => {
		setTimeout(() => {
			router.navigate('/Signin');
		}, 1000);
	});

	return (
		<View className="flex-1 bg-primary flex justify-center items-center">
			<Image
				source={require('../assets/images/adaptive-icon.png')}
				className="w-[200px] h-[200px]"
			/>
		</View>
	);
};

export default Splash;
