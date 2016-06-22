require 'html-proofer'

task :htmlproofer do
  HTMLProofer.check_directory("./_site", {
    :allow_hash_href => true,
    :typhoeus => {
      :ssl_verifypeer => false,
      :ssl_verifyhost => 0}
  }).run
end
