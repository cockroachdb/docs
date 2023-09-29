module JekyllVersions
  class Config
    attr_reader :versions, :release_info, :cockroachcloud

    def initialize(config, site)
      all_versions = site.config['release_info']&.keys || []

      ['versions'].each do |key|
        raise "Config missing `#{key}` key" if config[key].nil?
      end
      raise "Config missing `versions.stable` key" if config['versions']['stable'].nil?
      all_versions.each do |version|
        raise "Config missing `release_info.#{version}` key" if site.config['release_info'][version].nil?
      end
      @versions = config['versions']
      @release_info = site.config['release_info']
      @cockroachcloud = !!config['cockroachcloud']
    end

    def stable_version
      versions['stable']
    end
  end
end
