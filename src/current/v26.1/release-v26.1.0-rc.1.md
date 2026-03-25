## v26.1.0-rc.1

Release Date: January 22, 2026

{% include releases/new-release-downloads-docker-image.md release=include.release %}

<h3 id="v26-1-0-rc-1-bug-fixes">Bug fixes</h3>

- Fixed a bug where concurrent updates to a table using multiple column families during a partial index creation could result in data loss, incorrect NULL values, or validation failures in the resulting index. [#166324][#166324]

[#166324]: https://github.com/cockroachdb/cockroach/pull/166324