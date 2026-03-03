The following deprecations are announced in v24.3. If you plan to upgrade to v24.3 directly from v24.1 and skip v24.2, be sure to also review the [v24.2 release notes]({% link releases/v24.2.md %}) for deprecations.

- The session variable [`enforce_home_region_follower_reads_enabled`]({% link v24.3/session-variables.md %}#enforce-home-region-follower-reads-enabled) is now deprecated, and will be removed in a future release. The related session variable [`enforce_home_region`]({% link v24.3/session-variables.md %}#enforce-home-region) is **not** deprecated. [#129024][#129024]

[#129024]: https://github.com/cockroachdb/cockroach/pull/129024
