require 'openssl'
  OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:verify_mode] = OpenSSL::SSL::VERIFY_PEER
  OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:options] &= ~OpenSSL::SSL::OP_NO_SSLv2
  OpenSSL::SSL::SSLContext::DEFAULT_PARAMS[:options] &= ~OpenSSL::SSL::OP_NO_SSLv3
