Cockroach Labs does not recommend adding zone configurations manually, for the following reasons:

- It is easy to introduce logic errors and end up in a state where your replication is not behaving as it "should be".
- It is not easy to do proper change management and auditing of manually altered zone configurations.
- Manual zone config modifications are managed by the user with no help from the system and must be fully overwritten on each configuration change in order to take effect; this introduces another avenue for error.

For these reasons, most users should use [Multi-region SQL statements]({% link {{ page.version.version }}/multiregion-overview.md %}) instead; if additional control is needed, [Zone config extensions]({% link {{ page.version.version }}/zone-config-extensions.md %}) can be used to augment the multi-region SQL statements.
