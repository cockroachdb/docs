{% include_cached new-in.html version="v23.2" %} Use one of the following to prevent changefeeds from sending messages for changes caused by row-level TTL jobs:

- `sql.ttl.changefeed_replication.disabled` [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}): when `true`, deletes issued by TTL jobs on the cluster will not be emitted by changefeeds.
- `disable_changefeed_replication` [session variable]({% link {{ page.version.version }}/set-vars.md %}): when `true`, deletes issues by TTL jobs will not be emitted by changefeeds during that session.