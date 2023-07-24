require 'rss'

module RSSData
  class Generator < Jekyll::Generator
    def generate(site)
      Dir[File.join(site.config['data_dir'], '*.xml')].each do |f|
        site.data[File.basename(f, '.*')] = RSS::Parser.parse(File.read(f)).items.map do |item|
          {
            'title' => item.title,
            'link' => item.link,
            'pub_date' => item.pubDate,
            'creator' => item.dc_creator
          }
        end
      end
    end
  end
end
