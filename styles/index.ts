import {Dimensions, PixelRatio, Platform, StyleSheet} from 'react-native';

const {width: vw} = Dimensions.get('window');
const scale = vw > 570 ? 1.5 : vw / 380;

export const normalizeFont = (size: number) => {
	const newSize = size * scale > 35 ? 35 : size * scale;
	if (Platform.OS === 'ios') {
		return Math.round(PixelRatio.roundToNearestPixel(newSize));
	} else {
		return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
	}
};

export const GlobalColors = {
	background: '#FFFFFF',
	primary: '#051242',
	secondary: '#0D6EFD',
};

export const GlobalFontSizes = {
	xs: normalizeFont(12),
	sm: normalizeFont(15),
	md: normalizeFont(17),
	lg: normalizeFont(20),
	xl: normalizeFont(24),
	xxl: normalizeFont(26),
	xxxl: normalizeFont(29),
};

export const globalFonts = {
	plusJakartaSans: {
		regular: 'PlusJakartaSansRegular',
		medium: 'PlusJakartaSansMedium',
		light: 'PlusJakartaSansLight',
		bold: 'PlusJakartaSansBold',
		300: 'PlusJakartaSansLight',
		400: 'PlusJakartaSansRegular',
		500: 'PlusJakartaSansMedium',
		600: 'PlusJakartaSansSemiBold',
		700: 'PlusJakartaSansBold',
		800: 'PlusJakartaSansExtraBold',
		900: 'PlusJakartaSansBlack',
	},
};

export const globalStyles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: GlobalColors.background,
	},
	text: {
		color: '#000',
		fontWeight: '400',
		fontSize: GlobalFontSizes.sm,
	},
	overlay: {
		backgroundColor: '#000',
		opacity: 0.7,
		flex: 1,
		position: 'absolute',
		top: 0,
		bottom: 0,
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	overlayTransparent: {
		opacity: 0.7,
		flex: 1,
		position: 'absolute',
		top: 0,
		bottom: 0,
		height: '100%',
		width: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fontFamily: {
		fontFamily: globalFonts.plusJakartaSans.medium,
	},
});
