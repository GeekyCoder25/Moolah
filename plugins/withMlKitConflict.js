const {withAndroidManifest} = require('@expo/config-plugins');

module.exports = function withMlKitConflict(config) {
	return withAndroidManifest(config, config => {
		const mainApplication = config.modResults.manifest.application[0];

		// 1. Add the "tools" namespace to the <manifest> tag
		config.modResults.manifest.$['xmlns:tools'] =
			'http://schemas.android.com/tools';

		// 2. Find or create the meta-data entry for ML Kit dependencies
		const metaData = mainApplication['meta-data'] || [];
		const mlKitKey = 'com.google.mlkit.vision.DEPENDENCIES';

		const existingIndex = metaData.findIndex(
			item => item.$['android:name'] === mlKitKey,
		);

		// This merges "barcode_ui" (from expo) and "face" (from smile-identity)
		const mergedEntry = {
			$: {
				'android:name': mlKitKey,
				'android:value': 'barcode_ui,face',
				'tools:replace': 'android:value',
			},
		};

		if (existingIndex > -1) {
			metaData[existingIndex] = mergedEntry;
		} else {
			metaData.push(mergedEntry);
		}

		mainApplication['meta-data'] = metaData;
		return config;
	});
};
