require 'csv'
require 'yaml'

module Jekyll
  class ReleaseInfoGenerator < Jekyll::Generator
    safe true
    priority -100 # Making sure it runs first

    def generate(site)
      # Step 1: Determine the parent directory of the current site
      parent_dir = File.expand_path('..', site.source)

      # Step 2: Construct the paths to versions.csv and releases.yml
      # Try parent/current/_data first (standard layout), fall back to site.source/_data (Docker)
      versions_path = File.join(parent_dir, "current/_data/versions.csv")
      releases_path = File.join(parent_dir, "current/_data/releases.yml")

      # Fall back to site.source if parent path doesn't exist (e.g., in Docker container)
      unless File.exist?(versions_path)
        versions_path = File.join(site.source, "_data/versions.csv")
        releases_path = File.join(site.source, "_data/releases.yml")
      end

      # Load versions and releases data
      versions_data = CSV.read(versions_path, headers: true)
      releases_data = YAML.load_file(releases_path)

      # Process the data
      release_info = {}
      versions_data.each do |version|
        major_version = version['major_version']
        relevant_releases = releases_data.select { |release| release['major_version'] == major_version }
        
        # Validate all release dates before processing
        releases_with_invalid_dates = relevant_releases.select do |release|
          begin
            release['release_date'].nil? || release['release_date'].to_s.strip.empty? || !Date.parse(release['release_date'])
            false
          rescue Date::Error, ArgumentError
            true
          end
        end

        if releases_with_invalid_dates.any?
          error_details = releases_with_invalid_dates.map do |r| 
            name = r['release_name'] || 'unnamed'
            date = r['release_date'].inspect
            "#{name}: #{date}"
          end.join(", ")
          
          raise "Invalid release dates found in releases.yml: #{error_details}"
        end
        
        latest_release = relevant_releases.max_by { |release| Date.parse(release['release_date']) }
        
        # Populate release info
        if latest_release
          # Validate required docker configuration
          unless latest_release.dig('docker', 'docker_image')
            raise "Missing docker.docker_image for release #{latest_release['release_name'] || 'unnamed'} in releases.yml"
          end

          release_info[major_version] = {
            "version" => latest_release['release_name'],
            "release_name" => latest_release['release_name'],
            "major_version" => major_version,
            "build_time" => "#{latest_release['release_date']} 00:00:00",
            "go_version" => latest_release['go_version'],
            "docker_image" => latest_release['docker']['docker_image'],
            "release_type" => latest_release['release_type'],
            "crdb_branch_name" => version['crdb_branch_name'],
            "all_releases" => relevant_releases
          }
        else
          # Handle versions with no releases yet
          release_info[major_version] = {
            "version" => "No releases available",
            "release_name" => "No releases available",
            "major_version" => major_version,
            "build_time" => "N/A",
            "go_version" => "N/A",
            "docker_image" => "N/A",
            "release_type" => "N/A",
            "crdb_branch_name" => version['crdb_branch_name'] || 'master',
            "all_releases" => []
          }
        end
      end
      
      # Add the data to site object
      site.config['release_info'] = release_info
    end
  end
end
