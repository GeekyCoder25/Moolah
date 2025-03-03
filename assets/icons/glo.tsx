import * as React from 'react';
import Svg, {
	Circle,
	Path,
	Defs,
	RadialGradient,
	Stop,
	LinearGradient,
} from 'react-native-svg';
import type {SvgProps} from 'react-native-svg';
const GloIcon = (props: SvgProps) => (
	<Svg width={50} height={50} fill="none" {...props}>
		<Circle cx={25} cy={25} r={25} fill="#D5FFD5" />
		<Path
			fill="#50B651"
			d="M25.075 36.782c6.657 0 12.053-5.397 12.053-12.054s-5.396-12.054-12.053-12.054S13.02 18.072 13.02 24.729s5.397 12.054 12.054 12.054"
		/>
		<Path
			fill="url(#a)"
			fillRule="evenodd"
			d="M37.092 24.694c0 6.678-5.414 12.092-12.09 12.092S12.91 31.372 12.91 24.694c0-2.954.083-3.393 1.246-5.075 0 0-.06 1.9 1.333 3.03.866.703 1.77.195 3.424-.567 1.79-.825 3.245-1.357 4.38-1.216 1.71.212 6.98 3.377 9.732 2.747 2.197-.503 1.965-5.684 1.965-5.684 2.4 2.344 2.102 3.928 2.102 6.765"
			clipRule="evenodd"
			opacity={0.663}
		/>
		<Path
			fill="url(#b)"
			fillRule="evenodd"
			d="M30.19 33.576q6.56-6.17 2.18-14.137.023.015.542-1.87 2.33 2.822 2.479 6.967-.002 5.368-5.201 9.04"
			clipRule="evenodd"
			opacity={0.586}
		/>
		<Path
			fill="url(#c)"
			fillRule="evenodd"
			d="M28.116 17.594c-2.11-1.168-4.532-3.518-4.21-4.012.321-.493 4.5-.408 6.61.76 2.112 1.168 3.908 4.672 3.587 5.166-.322.493-3.876-.746-5.987-1.914"
			clipRule="evenodd"
			opacity={0.744}
		/>
		<Path
			fill="#fff"
			fillRule="evenodd"
			d="M29.954 27.697c-1.75 0-3.17-1.46-3.17-3.261s1.42-3.261 3.17-3.261c1.752 0 3.171 1.46 3.171 3.26 0 1.802-1.42 3.262-3.17 3.262m.023-1.035c1.093 0 1.98-.997 1.98-2.226s-.887-2.226-1.98-2.226-1.98.997-1.98 2.226.887 2.226 1.98 2.226M23.413 18.55h2.284v9.11h-1.254V19.55h-1.03zM21.71 21.268h1.186v7.608c0 .694-.73 1.416-1.44 1.726q-.504.221-1.86.262v-.757q1.325-.147 1.79-.59a1.8 1.8 0 0 0 .324-.842V26.44q-.475 1.009-1.198 1.338c-.5.27-1.518.225-1.934 0-.416-.226-1.026-.82-1.306-1.705-.077-.244-.27-.908-.25-1.612.019-.67.24-1.38.425-1.672.317-.498.816-1.122 1.573-1.382q.555-.192 2.055-.138v.753q-1.115-.075-1.392.075c-.276.15-.9.335-1.105 1.695-.206 1.359.006 2.471.658 2.82.224.12.62.262.985.136.701-.24 1.362-1.096 1.413-1.675q.075-.883.076-3.805"
			clipRule="evenodd"
		/>
		<Path
			fill="url(#d)"
			fillRule="evenodd"
			d="M36.713 27.114c-1.12 5.393-5.899 9.445-11.623 9.445-6.556 0-11.87-5.315-11.87-11.871 0-4.073 2.05-7.666 5.176-9.804a11.46 11.46 0 0 0-4.157 8.845c0 6.346 5.145 11.49 11.49 11.49 5.168 0 9.538-3.411 10.984-8.105"
			clipRule="evenodd"
		/>
		<Path
			fill="#fff"
			fillRule="evenodd"
			d="M25.09 10.63c-7.764 0-14.058 6.294-14.058 14.058s6.294 14.058 14.058 14.058 14.058-6.294 14.058-14.058S32.854 10.63 25.09 10.63m0 25.929c-6.556 0-11.87-5.315-11.87-11.87 0-4.073 2.05-7.667 5.176-9.805a11.8 11.8 0 0 1 6.694-2.067c6.556 0 11.87 5.315 11.87 11.871.001.815-.082 1.628-.247 2.426-1.12 5.393-5.899 9.445-11.623 9.445"
			clipRule="evenodd"
		/>
		<Defs>
			<RadialGradient
				id="c"
				cx={0}
				cy={0}
				r={1}
				gradientTransform="matrix(5.31835 2.6819 -1.11696 2.215 29.261 16.624)"
				gradientUnits="userSpaceOnUse"
			>
				<Stop offset={0.13} stopColor="#fff" />
				<Stop offset={0.29} stopColor="#fff" stopOpacity={0.69} />
				<Stop offset={0.45} stopColor="#fff" stopOpacity={0.4} />
				<Stop offset={0.59} stopColor="#fff" stopOpacity={0.18} />
				<Stop offset={0.69} stopColor="#fff" stopOpacity={0.05} />
				<Stop offset={0.74} stopColor="#fff" stopOpacity={0} />
			</RadialGradient>
			<RadialGradient
				id="d"
				cx={0}
				cy={0}
				r={1}
				gradientTransform="rotate(39.84 -16.726 48.402)scale(13.3479 14.5492)"
				gradientUnits="userSpaceOnUse"
			>
				<Stop offset={0.86} stopOpacity={0} />
				<Stop offset={0.98} stopOpacity={0.47} />
				<Stop offset={1} />
			</RadialGradient>
			<LinearGradient
				id="a"
				x1={24.535}
				x2={26.084}
				y1={19.58}
				y2={33.576}
				gradientUnits="userSpaceOnUse"
			>
				<Stop stopColor="#123214" />
				<Stop offset={0.46} stopColor="#3E7C37" />
				<Stop offset={0.91} stopColor="#5FBB46" />
			</LinearGradient>
			<LinearGradient
				id="b"
				x1={33.488}
				x2={33.488}
				y1={18.67}
				y2={29.988}
				gradientUnits="userSpaceOnUse"
			>
				<Stop stopColor="#fff" stopOpacity={0} />
				<Stop offset={0.64} stopColor="#fff" stopOpacity={0.43} />
				<Stop offset={1} stopColor="#fff" stopOpacity={0.42} />
			</LinearGradient>
		</Defs>
	</Svg>
);
export default GloIcon;
