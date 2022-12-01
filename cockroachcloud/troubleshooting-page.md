---
title: Troubleshoot CockroachDB Cloud
summary: CockroachDB Cloud errors and solutions.
toc: true
docs_area: manage
---

This page describes common {{ site.data.products.db }} errors and their solutions.

{{site.data.alerts.callout_danger}}
We have updated the CA certificate used by {{ site.data.products.serverless }} clusters. If you downloaded this certificate prior to June 17, 2021, **you must [download the updated certificate](connect-to-a-serverless-cluster.html#step-2-connect-to-your-cluster) by September 30, 2021** to avoid disruptions to your service.
{{site.data.alerts.end}}

## Connection errors

### Cannot load certificates

You see the following error when you are using the [`cockroach sql`](../{{site.versions["cloud"]}}/cockroach-sql.html) command to connect to your {{ site.data.products.serverless }} cluster:

~~~
ERROR: cannot load certificates.
Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.

problem using security settings: no certificates found; does certs dir exist?
Failed running "sql"
~~~

<h4>Solution</h4>

Update to the latest [CockroachDB client](../releases/index.html#production-releases). You need to use v21.2.5 or later of the CockroachDB client to connect to your cluster without specifying the CA certificate path in the connection string.

### Certificate signed by unknown authority

The following error is displayed when trying to connect to a cluster:

~~~
Error: x509: certificate signed by unknown authority
Failed running "sql"
~~~

There are two possible causes of this error: incorrect [routing ID](../{{site.versions["cloud"]}}/connect-to-the-database.html#connection-parameters) in the connection string, and CA certificate conflicts in the `cockroach` certificate search path.

<h4>Solution: incorrect routing ID in the connection string</h4>

Check if you are using the right routing ID in the [connection method](connect-to-your-cluster.html#step-3-connect-to-your-cluster). You can find your routing ID in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Select option/language** and select **General connection string**, and then locating the parameter `cluster={routing-id}` in your connection string.

<h4>Solution: CA certificate conflicts</h4>

If you have existing certificates in `~/.cockroach-certs` used to connect to {{ site.data.products.core }} or {{ site.data.products.dedicated }} clusters and are trying to connect to a {{ site.data.products.serverless }} cluster using [`cockroach sql`](../{{site.versions["cloud"]}}/cockroach-sql.html), you need download the CA cert by running the command from the **Cluster Overview** > **Connect** dialog if you have not already done so, and then set the `sslrootcert` parameter in the connection string you use when running `cockroach sql`.

For example, on Linux and Mac, set the `sslrootcert` parameter to `$HOME/.postgresql/root.crt` in the connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url "postgresql://maxroach@free-tier4.aws-us-west-2.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt&options=--cluster%3Ddim-dog-2114"
~~~

### Invalid cluster name in a third-party tool

The following error is displayed if you try to connect to a [third-party tool](../stable/third-party-database-tools.html) with the wrong cluster or database name. The actual error message may vary depending on your tool:

~~~
FATAL: CodeParamsRoutingFailed: rejected by BackendConfigFromParams: Invalid cluster name
~~~

<h4>Solution</h4>

Check that you are using the correct cluster and database names. You can find these parameters in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters**. For most tools, the full name of your database should be in the format `<routing-id>.<database>` for {{ site.data.products.serverless }} clusters.

For connection examples with your tool, see [these examples](../stable/third-party-database-tools.html).

### I/O timeout

The following error is most often caused by trying to connect to a cluster without [authorizing the right network](connect-to-your-cluster.html#step-1-authorize-your-network), not having an internet connection, or an issue in your application environment:

~~~
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp 35.196.33.161:26257: i/o timeout
Failed running "sql"
~~~

<h4>Solution</h4>

Check if you have internet access.

If you do have internet access, check if you have [authorized the right network](connect-to-your-cluster.html#step-1-authorize-your-network):

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.

- In a production environment, you need to authorize your application server’s network.

- An `i/o timeout` can also be caused by firewall rules, which require your network administrator to investigate.

If neither of the above steps succeed, investigate your application's timeout value and environment:

- Increase the timeout value (e.g., from 5 seconds to 30 seconds) for your application's driver or framework and see if connection succeeds.

- If you can connect and run the same query in the SQL CLI, investigate your application environment.
{% comment %}
Update this in future if we have more troubleshooting guidance.
{% endcomment %}

- Investigate your network infrastructure to see if there is a network related performance problem, or [contact support](https://support.cockroachlabs.com/) with these details.

### No such host

The following error is displayed when you supply an incorrect host name:

~~~
ERROR: cannot dial server.
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp: lookup gcp-us-east4.crdb.io: no such host
Failed running "sql"
~~~

<h4>Solution</h4>

Check if you are using the correct host name.

You can find your host name in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters** and locating the **Host** field. If the error persists, [contact Support](https://support.cockroachlabs.com/).

### Connection refused

The following error is displayed if your cluster connection is dropped:

~~~
Error: dial tcp 35.240.101.1:26257: connect: connection refused
~~~

<h4>Solution</h4>

{{ site.data.products.db }} connections can occasionally become invalid due to upgrades, restarts, or other disruptions. Your application should use a [pool of persistent connections](../{{site.versions["cloud"]}}/connection-pooling.html) and connection retry logic to ensure that connections remain current. See the [Production Checklist](production-checklist.html) for more information.

### External network access disabled

The following error is displayed if you try to access cloud storage from an organization without billing information on file:

~~~
ERROR: external network access is disabled
~~~

<h4>Solution</h4>

You must [set up billing information](billing-management.html) for your organization to use cloud storage, but you can leave your spend limit at the $0 default. If you don't have a credit card on file, you will be limited to `userfile` storage for [bulk operations](run-bulk-operations.html).

### Outbound I/O is disabled

The following error is displayed if you try to set up a [changefeed](../{{site.versions["cloud"]}}/create-and-configure-changefeeds.html) for your {{ site.data.products.serverless }} cluster without having billing information on file:

~~~
pq: Outbound IO is disabled by configuration
~~~

<h4>Solution</h4>

You must [set up billing information](billing-management.html) for your organization to use [Core](../{{site.versions["cloud"]}}/changefeed-examples.html#create-a-core-changefeed) and [Enterprise](../{{site.versions["cloud"]}}/changefeed-examples.html) changefeeds, but you can leave your spend limit at the $0 default.

## Security errors

### Incorrect certs path

The following error is displayed if the directory path for the CA certificate is incorrect:

~~~
Error: open test-cluster-ca.crt: no such file or directory
Failed running "sql"
~~~

<h4>Solution</h4>

Check the directory path for the [CA certificate in the connection method](connect-to-your-cluster.html#step-3-connect-to-your-cluster). If you have downloaded multiple CA certificates, check that you are using the right one.

### Issue with CockroachDB workloads

The following error is displayed while trying to a run [CockroachDB workload](../{{site.versions["cloud"]}}/cockroach-workload.html) with `sslmode=verify-full`:

~~~
Error: x509: certificate signed by unknown authority
~~~

<h4>Solution</h4>

This is a known issue. Use `sslmode=require` instead.

{{site.data.alerts.callout_info}}
Using `sslmode=require` can leave your cluster vulnerable to MITM and impersonation attacks. For more information, see PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.
{{site.data.alerts.end}}
