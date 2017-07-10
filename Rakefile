require 'html-proofer'
require 'yaml'

task :htmlproofer do
  baseurl = ENV['JEKYLL_BASEURL'] || YAML.load_file('_config.yml')['baseurl']
  HTMLProofer.check_directory("./_site", {
    :allow_hash_href => true,
    :url_swap => { /^#{Regexp.quote(baseurl)}/ => '' },
    :typhoeus => {
      :ssl_verifypeer => false,
      :ssl_verifyhost => 0}
  }).run
end

task :blog_posts do
  require 'open-uri'
  IO.copy_stream(open('https://www.cockroachlabs.com/blog/index.xml'), '_data/blog_posts.xml')
end
