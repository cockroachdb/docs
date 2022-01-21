require 'json'
require 'liquid'

module SidebarHTMLTest
  class Generator < Jekyll::Generator
    def generate(site)
      @site = site

      Dir[File.join(site.config['includes_dir'], 'sidebar-data-v*.json')].each do |f|
        next unless !!site.config['cockroachcloud'] == f.include?('cockroachcloud')
        partial = site.liquid_renderer.file(f).parse(File.read(f))
        json = partial.render!(site.site_payload, {registers: {site: site}})
        version = f.match(/sidebar-data-(v\d+\.\d+)/)[1]
        render_sidebar(json, version)
      end
    end

    def render_sidebar(json, version)
      dest = File.join(@site.dest, "_internal", "sidebar-#{version}.html")
      FileUtils.mkdir_p(File.dirname(dest))
      File.open(dest, 'w') do |w|
        w.write("<!DOCTYPE html>\n")
        render_items(w, JSON.parse(json, symbolize_names: true), version)
      end
    end

    def render_items(w, items, version)
      items.each do |item|
        item[:urls].each do |url|
          # Replace version variable
          url.gsub!('${VERSION}', version)
          # Write the test file, adding the baseurl if the url is relative
          if url.start_with?('http')
            w.write("<a href='#{url}'>#{item[:title]}</a>\n")
          else
            w.write("<a href='#{File.join(@site.baseurl, url)}'>#{item[:title]}</a>\n")
          end
        end if item[:urls]
        render_items(w, item[:items], version) if item[:items]
      end
    end
  end
end
