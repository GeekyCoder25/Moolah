import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const WalletBgIcon = (props: SvgProps) => (
	<Svg width={103} height={94} fill="none" {...props}>
		<Path
			fill="#0D6EFD"
			d="M0 0h102.5s-2.471 11.186-10 18.5c-17.5 17-49.77 8.237-65 25.5-11.037 12.51 5.513 26.423-6.5 38-7.23 6.969-21 11.5-21 11.5z"
		/>
	</Svg>
);
export default WalletBgIcon;
