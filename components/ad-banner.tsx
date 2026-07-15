import {AxiosClient} from '@/utils/axios';
import {useQuery} from '@tanstack/react-query';
import {useEffect, useState} from 'react';
import {Image, Linking, TouchableOpacity} from 'react-native';

interface AdBannerResponse {
	status: number;
	message: string;
	data: {
		active: boolean;
		image_url: string;
		link_url: string;
	};
}

// Fetches the remotely-configured promo banner and renders it as a tappable
// image that opens its link (e.g. WhatsApp). Renders nothing when the banner is
// inactive or has no image.
const AdBanner = ({className = ''}: {className?: string}) => {
	const {data} = useQuery({
		queryKey: ['ad-banner'],
		queryFn: async () => {
			const axiosClient = new AxiosClient();
			const response = await axiosClient.get<AdBannerResponse>('/ad-banner');
			return response.data;
		},
	});

	const banner = data?.data;
	// Default to a wide banner ratio until the real image size loads.
	const [aspectRatio, setAspectRatio] = useState(0);

	useEffect(() => {
		if (!banner?.image_url) return;
		Image.getSize(
			banner.image_url,
			(width, height) => {
				if (width && height) setAspectRatio(width / height);
			},
			() => {},
		);
	}, [banner?.image_url]);

	if (!banner?.active || !banner?.image_url) return null;

	const handlePress = () => {
		if (banner.link_url) Linking.openURL(banner.link_url).catch(() => {});
	};

	return (
		<TouchableOpacity
			activeOpacity={0.9}
			onPress={handlePress}
			disabled={!banner.link_url}
			className={`rounded-xl overflow-hidden ${className}`}
		>
			<Image
				source={{uri: banner.image_url}}
				style={{width: '100%', aspectRatio}}
				resizeMode="cover"
			/>
		</TouchableOpacity>
	);
};

export default AdBanner;
