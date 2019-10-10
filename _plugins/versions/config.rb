module JekyllVersions
  class Config
    attr_reader :versions, :release_info, :cockroachcloud

    def initialize(config)
      ['versions', 'release_info'].each do |key|
        raise "Config missing `#{key}` key" if config[key].nil?
      end
      raise "Config missing `versions.stable` key" if config['versions']['stable'].nil?
      config['versions'].each do |_, v|
        raise "Config missing `release_info.#{v}` key" if config['release_info'][v].nil?
      end
      @versions = config['versions']
      @release_info = config['release_info']
      @cockroachcloud = !!config['cockroachcloud']
    end

    def stable_version
      versions['stable']
    end
  end
end
