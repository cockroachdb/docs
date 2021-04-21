Use the [`cockroach demo`](cockroach-demo.html) command shown below to start the cluster. This particular combination of flags results in a demo cluster of 9 nodes, with 3 nodes in each region. It sets the appropriate [node localities](cockroach-start.html#locality) and also simulates the network latency that would occur between nodes in these localities. For more information about each flag, see the [`cockroach demo`](cockroach-demo.html#flags) documentation, especially for [`--global`](cockroach-demo.html#global-flag).

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9 --empty --insecure
~~~

When the cluster starts, you'll see a message like the one shown below, followed by a SQL prompt. Note the URLs for:

- Viewing the [DB Console](ui-overview.html): `http://127.0.0.1:8080`.
- Connecting to the database from a [SQL shell](cockroach-sql.html) or a [programming language](connect-to-the-database.html): `postgres://root@127.0.0.1:26257?sslmode=disable`.

~~~
# Welcome to the CockroachDB demo database!
#
# You are connected to a temporary, in-memory CockroachDB cluster of 9 nodes.
#
# This demo session will attempt to enable enterprise features
# by acquiring a temporary license from Cockroach Labs in the background.
# To disable this behavior, set the environment variable
# COCKROACH_SKIP_ENABLING_DIAGNOSTIC_REPORTING=true.
#
# Reminder: your changes to data stored in the demo session will not be saved!
#
# Connection parameters:
#   (console) http://127.0.0.1:8080
#   (sql)     postgres://root:unused@?host=%2Fvar%2Ffolders%2Fbh%2F_32m6zhj67z534slcg79nm_w0000gp%2FT%2Fdemo956443538&port=26257
#   (sql/tcp) postgres://root@127.0.0.1:26257?sslmode=disable
# 
# To display connection parameters for other nodes, use \demo ls.
# Server version: CockroachDB CCL v21.1.0-alpha.3-1368-g0ee391c3b9 (x86_64-apple-darwin19.6.0, built 2021/03/18 14:54:44, go1.16) (same version as client)
# Cluster ID: 063fa964-1f43-4b7f-b1e6-f70afd9ad921
~~~
