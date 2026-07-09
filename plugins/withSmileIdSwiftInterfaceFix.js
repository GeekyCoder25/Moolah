const {withDangerousMod} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Fixes the iOS build error:
 *   "underlying Objective-C module 'SmileID' not found"
 *   (Verifying emitted module interface SmileID.swiftinterface failed)
 *
 * The SmileID pod is built with library evolution (BUILD_LIBRARY_FOR_DISTRIBUTION
 * = YES), which emits a .swiftinterface whose verification fails. Disabling that
 * flag for the SmileID targets in the Podfile's post_install resolves it.
 *
 * This runs on `expo prebuild`, so the fix survives Podfile regeneration.
 */
const MARKER = 'SmileID Swift module interface verification fix';

const SNIPPET = `
    # ${MARKER}
    installer.pods_project.targets.each do |target|
      if ['SmileID', 'SmileIDSDK'].include?(target.name)
        target.build_configurations.each do |config|
          config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
          config.build_settings['SWIFT_SERIALIZE_DEBUGGING_OPTIONS'] = 'NO'
        end
      end
    end

    installer.generated_projects.each do |project|
      project.targets.each do |target|
        if target.name.include?('SmileID')
          target.build_configurations.each do |config|
            config.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'NO'
          end
        end
      end
    end
`;

const withSmileIdSwiftInterfaceFix = config => {
	return withDangerousMod(config, [
		'ios',
		config => {
			const podfilePath = path.join(
				config.modRequest.platformProjectRoot,
				'Podfile',
			);
			let contents = fs.readFileSync(podfilePath, 'utf8');

			// Idempotent: skip if already applied
			if (contents.includes(MARKER)) {
				return config;
			}

			// Insert right after the react_native_post_install(...) call
			const anchor = /react_native_post_install\([\s\S]*?\)\n/;
			if (!anchor.test(contents)) {
				throw new Error(
					'[withSmileIdSwiftInterfaceFix] Could not find react_native_post_install call in Podfile',
				);
			}

			contents = contents.replace(anchor, match => `${match}${SNIPPET}`);
			fs.writeFileSync(podfilePath, contents);

			return config;
		},
	]);
};

module.exports = withSmileIdSwiftInterfaceFix;
