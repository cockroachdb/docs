- For guidance on cluster topology, clock synchronization, cache and SQL memory size, and file descriptor limits, see [Recommended Production Settings](recommended-production-settings.html).

- Decide how you want to access your Admin UI:
  - Only from specific IP addresses, which requires you to set firewall rules to allow communication on port `8080` *(documented on this page)*.
  - Using an SSH tunnel, which requires you to use `--http-host=localhost` when starting your nodes.
