require "openssl"
require "net/http"

# Monkey patch to completely disable SSL verification
module OpenSSL
  module SSL
    remove_const :VERIFY_PEER
    VERIFY_PEER = VERIFY_NONE
  end
end

# Override Net::HTTP SSL context creation
class Net::HTTP
  alias_method :original_use_ssl=, :use_ssl=
  
  def use_ssl=(flag)
    self.original_use_ssl = flag
    if flag
      @ssl_context = OpenSSL::SSL::SSLContext.new
      @ssl_context.verify_mode = OpenSSL::SSL::VERIFY_NONE
      @ssl_context.verify_hostname = false
    end
  end
end

# Set environment variable as fallback
ENV['SSL_VERIFY'] = 'false'