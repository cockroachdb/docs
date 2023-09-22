require 'csv'
require 'json'
require 'net/http'
require 'yaml'

module JekyllVersions
  class VersionedPage
    attr_reader :page, :key, :version

    def initialize(config, page)
      @config = config
      @page = page
      @version = Version.from_path(config, page.url)
      @key = page.data['key'] || unversioned_path
    end

    def unversioned_path
      # Using `page.url` properly takes the permalink into
      # account, but we need to convert the URL back to a path by a) dropping
      # the leading slash and maybe the version from the front of the URL, and
      # b) tacking on `index.html` to bare directories.
      url = page.url.split('/').drop(@version ? 2 : 1).join('/')
      url << 'index.html' if url.end_with?('/')
      url
    end

    def stable?
      version && version.stable?
    end

    def url

      page.url.split('/', -1)
        .map { |p| p.gsub(Version::REGEX, version.slug) }
        .join('/')
    end

    def release_info
      release_data_from_csv[demand_version]
    end

    def sidebar_data
      s = "sidebar-data-"
      s << demand_version
      s << ".cockroachcloud" if @config.cockroachcloud
      s << ".json"
    end

    def release_data_from_csv
      base_path = ENV['RELEASES_BASE_PATH'] || "/src/current"
      versions_csv_path = File.join(base_path, '_data', 'versions.csv')
      releases_yml_path = File.join(base_path, '_data', 'releases.yml')
    
      releases_info = {}
      puts "new page"
      # Load data from releases.yml
      all_releases = YAML.load_file(releases_yml_path)
    
      # Read versions.csv and find the corresponding release in releases.yml
      CSV.foreach(versions_csv_path, headers: true) do |row|
        major_version = row['major_version']
        latest_release = all_releases.select { |r| r['major_version'] == major_version }.max_by { |release| release['release_date'] } || {}
        if !latest_release.empty?
          branch_name = get_branch_name(major_version)
      
          releases_info[major_version] = {
            'crdb_branch_name' => branch_name,
            'name' => latest_release['release_name']
            # Add any other fields from the csv or yml as needed
          }
        else      
          releases_info[major_version] = {
            'crdb_branch_name' => "master",
            'name' => major_version
            # Add any other fields from the csv or yml as needed
          }
        end
      end
    
      releases_info
    end

    private

    def get_branch_name(major_version)
      branch_name = "release-#{major_version.sub('v', '')}"
      if branch_exists?(branch_name)
        branch_name
      else
        'master'
      end
    end
    
    def branch_exists?(branch_name)
      uri = URI("https://api.github.com/repos/cockroachdb/cockroach/branches/#{branch_name}")
      res = Net::HTTP.get_response(uri)
      res.is_a?(Net::HTTPSuccess)
    end

    def demand_version
      version&.version || @config.stable_version
    end

  end
end
