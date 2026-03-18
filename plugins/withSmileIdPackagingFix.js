const {withAppBuildGradle} = require('@expo/config-plugins');

/**
 * Fixes duplicate META-INF/versions/9/OSGI-INF/MANIFEST.MF conflict
 * between com.squareup.okhttp3:logging-interceptor and org.jspecify:jspecify
 * brought in by com.smileidentity:android-sdk
 */
const withSmileIdPackagingFix = config => {
	return withAppBuildGradle(config, config => {
		const gradle = config.modResults.contents;

		// Only add if not already present
		if (gradle.includes('META-INF/versions/9/OSGI-INF/MANIFEST.MF')) {
			return config;
		}

		const packagingBlock = `
    packaging {
        resources {
            excludes += ['META-INF/versions/9/OSGI-INF/MANIFEST.MF']
        }
    }`;

		// Insert into the android { } block
		config.modResults.contents = gradle.replace(
			/android\s*\{/,
			`android {${packagingBlock}`,
		);

		return config;
	});
};

module.exports = withSmileIdPackagingFix;
