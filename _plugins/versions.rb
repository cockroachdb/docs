# This plugin manages docs versioning based on the following conventions. Docs
# for each non-patch release of CockroachDB--that is, each release of
# CockroachDB that has its own release branch in the cockroachdb/cockroach
# repository--are expected to be stored in in a top-level directory named after
# that version. For example, docs for CockroachDB v1.1 are expected to be stored
# in a directory named `v1.1`. Docs which do not logically belong to one
# version, like release notes, are instead stored at the root of the repository.
#
# The name mappings under the `version` key in config.yml are used to build
# additional aliased versions. (At the time of writing, we named a `stable` and
# `edge` version.) These are implemented as directory symlinks. For example, if
# `stable: v1.0` is specified, a symlink `stable -> v1.0` will be written to the
# build directory. The `stable` mapping is special and must exist, as
# `docs/FOO.html` will be automatically redirected to `docs/stable/FOO.html` for
# every FOO.md in the stable directory. Other name mappings are optional and can
# be added and removed at will.
#
# If a page is renamed, set `key: original-file-name.html` in its front matter
# so the version switcher can find its old versions.
#
# Each page has the following variables injected:
#     `version` — the raw (non-logical) version of the page, like `v1.0`
#     `release_info` — a hash with information about the latest release
#     `versions` — a list of versions in which this page exists
#         This list powers the version switcher. Each entry in the list has a
#         human-friendly `name`, like "v1.0 (Stable)", a raw `version`, like
#         "v1.0", and a `url` to the page in that version.
#     `sidebar_data` — the name of the file containing the page's sidebar data
#         Non-versioned pages use the `STABLE_VERSION`'s sidebar data.
#     `canonical` — the relative URL of the stable version of the page, if any

Jekyll::External.require_with_graceful_fail('jekyll-redirect-from')

require_relative 'versions/symlink'
require_relative 'versions/version'
require_relative 'versions/versioned_page'
require_relative 'versions/generator'

# Silence annoying "directory is already being watched" warning due to harmless
# symlink usage.
# See: https://github.com/guard/listen/wiki/Duplicate-directory-errors
require 'listen/record/symlink_detector'
class Listen::Record::SymlinkDetector
  def _fail(_, _); end
end
