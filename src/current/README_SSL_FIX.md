# SSL Fix for Jekyll Build

If you encounter SSL certificate verification errors when running Jekyll builds, you can use the provided `openssl_fix.rb` script as a workaround.

## Usage

Run the Jekyll build with the `RUBYOPT` environment variable:

```bash
RUBYOPT="-r./openssl_fix.rb" bundle exec jekyll build --incremental --config _config_base.yml,_config_cockroachdb.yml
```

## What it does

This script disables SSL certificate verification for Ruby's OpenSSL library. It's intended as a temporary workaround for local development environments where SSL certificate issues may occur.

⚠️ **Warning**: This script disables SSL verification and should only be used in local development environments. Do not use in production.
