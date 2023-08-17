Use the following [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) command to start the cluster. This particular combination of flags results in a demo cluster of 9 nodes, with 3 nodes in each region. It sets the appropriate [node localities]({% link {{ page.version.version }}/cockroach-start.md %}#locality) and also simulates the network latency that would occur between nodes in these localities. For more information about each flag, see the [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}#flags) documentation, especially for [`--global`]({% link {{ page.version.version }}/cockroach-demo.md %}#global-flag).

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach demo --global --nodes 9 --no-example-database --insecure
~~~

When the cluster starts, you'll see a message like the one shown below, followed by a SQL prompt. Note the URLs for:

- Viewing the [DB Console]({% link {{ page.version.version }}/ui-overview.md %}): `http://127.0.0.1:8080`.
- Connecting to the database from a [SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}) or a [programming language]({% link {{ page.version.version }}/connect-to-the-database.md %}): `postgres://root@127.0.0.1:26257?sslmode=disable`.

~~~
#
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
#   (webui)    http://127.0.0.1:8080/demologin?password=demo76950&username=demo
#   (sql)      postgres://demo:demo76950@127.0.0.1:26257?sslmode=require
#   (sql/unix) postgres://demo:demo76950@?host=%2Fvar%2Ffolders%2Fc8%2Fb_q93vjj0ybfz0fz0z8vy9zc0000gp%2FT%2Fdemo070856957&port=26257
#
# To display connection parameters for other nodes, use \demo ls.
#
# The user "demo" with password "demo76950" has been created. Use it to access the Web UI!
#
# Server version: CockroachDB CCL v21.1.2 (x86_64-apple-darwin19, built 2021/06/07 18:13:04, go1.15.11) (same version as client)
# Cluster ID: bfd9fc91-69bd-4417-a2f7-66e556bf2cfd
# Organization: Cockroach Demo
#
# Enter \? for a brief introduction.
#
~~~
