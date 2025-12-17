/**
 * Release Info Data File
 *
 * Replicates Jekyll's ReleaseInfoGenerator plugin
 * Combines versions.csv and releases.yml to create release_info object
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = function() {
  const dataDir = path.join(__dirname);

  // Load versions.csv
  const versionsPath = path.join(dataDir, 'versions.csv');
  const versionsContent = fs.readFileSync(versionsPath, 'utf8');
  const versionsLines = versionsContent.trim().split('\n');
  const headers = versionsLines[0].split(',');

  const versions = versionsLines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });

  // Load releases.yml
  const releasesPath = path.join(dataDir, 'releases.yml');
  const releasesContent = fs.readFileSync(releasesPath, 'utf8');
  const releases = yaml.load(releasesContent);

  // Build release_info object keyed by major_version
  const releaseInfo = {};

  versions.forEach(version => {
    const majorVersion = version.major_version;
    if (!majorVersion) return;

    // Find all releases for this major version
    const relevantReleases = releases.filter(r => r.major_version === majorVersion);

    // Find the latest release by date
    let latestRelease = null;
    relevantReleases.forEach(release => {
      if (!release.release_date) return;
      if (!latestRelease) {
        latestRelease = release;
      } else {
        try {
          const currentDate = new Date(latestRelease.release_date);
          const releaseDate = new Date(release.release_date);
          if (releaseDate > currentDate) {
            latestRelease = release;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });

    // Build the release_info entry
    if (latestRelease) {
      releaseInfo[majorVersion] = {
        version: latestRelease.release_name,
        release_name: latestRelease.release_name,
        major_version: majorVersion,
        build_time: `${latestRelease.release_date} 00:00:00`,
        go_version: latestRelease.go_version,
        docker_image: latestRelease.docker?.docker_image || 'N/A',
        release_type: latestRelease.release_type,
        crdb_branch_name: version.crdb_branch_name || 'master',
        all_releases: relevantReleases
      };
    } else {
      // Handle versions with no releases yet
      releaseInfo[majorVersion] = {
        version: "No releases available",
        release_name: "No releases available",
        major_version: majorVersion,
        build_time: "N/A",
        go_version: "N/A",
        docker_image: "N/A",
        release_type: "N/A",
        crdb_branch_name: version.crdb_branch_name || 'master',
        all_releases: []
      };
    }
  });

  return releaseInfo;
};
