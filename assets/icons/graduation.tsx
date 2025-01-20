import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const GraduationCapIcon = (props: SvgProps) => (
	<Svg width={25} height={25} fill="none" {...props}>
		<Path
			fill="#0D6EFD"
			d="M17.33 16.14a1 1 0 0 1 1.55.84v1.29c0 1.27-.99 2.63-2.18 3.03l-3.19 1.06c-.56.19-1.47.19-2.02 0L8.3 21.3c-1.2-.4-2.18-1.76-2.18-3.03v-1.3c0-.79.88-1.27 1.54-.84l2.06 1.34c.79.53 1.79.79 2.79.79s2-.26 2.79-.79z"
		/>
		<Path
			fill="#0D6EFD"
			d="m20.48 6.96-5.99-3.93c-1.08-.71-2.86-.71-3.94 0L4.53 6.96c-1.93 1.25-1.93 4.08 0 5.34l1.6 1.04 4.42 2.88c1.08.71 2.86.71 3.94 0l4.39-2.88 1.37-.9v3.06c0 .41.34.75.75.75s.75-.34.75-.75v-4.92c.4-1.29-.01-2.79-1.27-3.62"
		/>
	</Svg>
);
export default GraduationCapIcon;
