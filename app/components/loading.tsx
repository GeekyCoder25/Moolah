import React from 'react';
import {
	ActivityIndicator,
	Keyboard,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';

import {GlobalColors, globalStyles} from '../../styles';
import {useGlobalStore} from '../../context/store';

const Loading = ({loadingProp}: {loadingProp?: boolean}) => {
	const {loading} = useGlobalStore();

	return (
		(loadingProp || loading) && (
			<Pressable style={LoadingStyles.loader} onPress={Keyboard.dismiss}>
				<View style={globalStyles.overlay} />
				<View className="justify-center items-center flex-1">
					<ActivityIndicator size={'large'} color={GlobalColors.secondary} />
				</View>
			</Pressable>
		)
	);
};

export default Loading;

const LoadingStyles = StyleSheet.create({
	loader: {
		justifyContent: 'center',
		alignItems: 'center',
		flex: 1,
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
	},
});
