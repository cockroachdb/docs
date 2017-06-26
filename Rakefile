require 'html-proofer'

task :htmlproofer do
  HTMLProofer.check_directory("./_site", {
    :allow_hash_href => true,
    :typhoeus => {
      :ssl_verifypeer => false,
      :ssl_verifyhost => 0}
  }).run
end

task :blog_posts do
  require 'open-uri'
  IO.copy_stream(open('https://www.cockroachlabs.com/blog/index.xml'), 'blog-posts.xml')
end
