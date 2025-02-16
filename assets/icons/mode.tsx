import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const ModeIcon = (props: SvgProps) => (
	<Svg width={24} height={24} fill="none" {...props}>
		<Path
			fill="#4E4E4E"
			d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.39 5.39 0 0 1-4.4 2.26 5.404 5.404 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"
		/>
	</Svg>
);
export default ModeIcon;
