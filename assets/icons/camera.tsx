import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const CameraIcon = (props: SvgProps) => (
	<Svg width={25} height={25} fill="none" {...props}>
		<Path
			fill="#0D6EFD"
			d="M17.5 4h-10c-3 0-5 1.5-5 5v7c0 3.5 2 5 5 5h10c3 0 5-1.5 5-5V9c0-3.5-2-5-5-5m-9 14.25h-3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3c.41 0 .75.34.75.75s-.34.75-.75.75m4-2.75c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3m7-7.25h-3c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h3c.41 0 .75.34.75.75s-.34.75-.75.75"
		/>
	</Svg>
);
export default CameraIcon;
