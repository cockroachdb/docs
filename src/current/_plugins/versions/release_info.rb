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
      versions_path = File.join(parent_dir, "current/_data/versions.csv")
      releases_path = File.join(parent_dir, "current/_data/releases.yml")

      # Load versions and releases data
      versions_data = CSV.read(versions_path, headers: true)
      releases_data = YAML.load_file(releases_path)

      # Process the data
      release_info = {}
      versions_data.each do |version|
        major_version = version['major_version']
        relevant_releases = releases_data.select { |release| release['major_version'] == major_version }
        latest_release = relevant_releases.max_by { |release| Date.parse(release['release_date']) }
        
        # Populate release info
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
      end
      
      # Add the data to site object
      site.config['release_info'] = release_info
    end
  end
end
