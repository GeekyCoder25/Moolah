/** @type {import('tailwindcss').Config} */
module.exports = {
	// NOTE: Update this to include the paths to all of your component files.
	content: ['./app/**/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		fontWeight: {},
		extend: {
			colors: {
				primary: '#051242',
				secondary: '#0D6EFD',
				dark: '#121212',
			},
			fontFamily: {
				extralight: ['PlusJakartaSansExtraLight'],
				light: ['PlusJakartaSansLight'],
				normal: ['PlusJakartaSansRegular'],
				regular: ['PlusJakartaSansRegular'],
				medium: ['PlusJakartaSansMedium'],
				'plus-semibold': ['PlusJakartaSansSemiBold'],
				semibold: ['PlusJakartaSansSemiBold'],
				bold: ['PlusJakartaSansBold'],
				'plus-bold': ['PlusJakartaSansBold'],
				extrabold: ['PlusJakartaSansExtraBold'],
			},
		},
	},
	plugins: [],
	darkMode: 'class',
};
