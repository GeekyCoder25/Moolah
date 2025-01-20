import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const MonitorIcon = (props: SvgProps) => (
	<Svg width={24} height={25} fill="none" {...props}>
		<Path
			fill="#0D6EFD"
			d="M17.56 2.5H6.41C3.98 2.5 2 4.48 2 6.91v6.7a4.41 4.41 0 0 0 4.41 4.41h3.84c.55 0 1 .45 1 1v.97c0 .55-.45 1-1 1H7.83a.755.755 0 0 0 0 1.51h8.35c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.42c-.55 0-1-.45-1-1v-.97c0-.55.45-1 1-1h3.81a4.41 4.41 0 0 0 4.41-4.41v-6.7c-.01-2.44-1.99-4.42-4.42-4.42"
		/>
	</Svg>
);
export default MonitorIcon;
