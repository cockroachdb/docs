---
title: Troubleshoot Cloud Setup
summary: CockroachDB Cloud errors and solutions.
toc: true
docs_area: manage
---

This page describes common CockroachDB {{ site.data.products.cloud }} errors and their solutions.

{{site.data.alerts.callout_danger}}
We have updated the CA certificate used by CockroachDB {{ site.data.products.serverless }} clusters. If you downloaded this certificate prior to June 17, 2021, **you must [download the updated certificate]({% link cockroachcloud/connect-to-a-serverless-cluster.md %}#connect-to-your-cluster) by September 30, 2021** to avoid disruptions to your service.
{{site.data.alerts.end}}

## Connection errors

### Cannot load certificates

You see the following error when you are using the [`cockroach sql`]({% link {{site.current_cloud_version}}/cockroach-sql.md %}) command to connect to your CockroachDB {{ site.data.products.serverless }} cluster:

~~~
ERROR: cannot load certificates.
Check your certificate settings, set --certs-dir, or use --insecure for insecure clusters.

problem using security settings: no certificates found; does certs dir exist?
Failed running "sql"
~~~

<h4>Solution</h4>

Update to the latest [CockroachDB client]({% link releases/index.md %}#production-releases). You need to use v21.2.5 or later of the CockroachDB client to connect to your cluster without specifying the CA certificate path in the connection string.

### Certificate signed by unknown authority

The following error is displayed when trying to connect to a cluster:

~~~
Error: x509: certificate signed by unknown authority
Failed running "sql"
~~~

<h4>Solution: CA certificate conflicts</h4>

If you have existing certificates in `~/.cockroach-certs` used to connect to CockroachDB {{ site.data.products.core }} or CockroachDB {{ site.data.products.dedicated }} clusters and are trying to connect to a CockroachDB {{ site.data.products.serverless }} cluster using [`cockroach sql`]({% link {{site.current_cloud_version}}/cockroach-sql.md %}), you need download the CA cert by running the command from the **Cluster Overview** > **Connect** dialog if you have not already done so, and then set the `sslrootcert` parameter in the connection string you use when running `cockroach sql`.

For example, on Linux and Mac, set the `sslrootcert` parameter to `$HOME/.postgresql/root.crt` in the connection string:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url "postgresql://maxroach@blue-dog-147.6wr.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full&sslrootcert=$HOME/.postgresql/root.crt"
~~~

### Invalid cluster name in a third-party tool

The following error is displayed if you try to connect to a [third-party tool]({% link {{ site.current_cloud_version}}/third-party-database-tools.md %}) with the wrong cluster or database name. The actual error message may vary depending on your tool:

~~~
FATAL: CodeParamsRoutingFailed: rejected by BackendConfigFromParams: Invalid cluster name
~~~

<h4>Solution</h4>

Check that you are using the correct cluster and database names. You can find these parameters in the CockroachDB {{ site.data.products.cloud }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters**.

For connection examples with your tool, see [these examples]({% link {{ site.current_cloud_version}}/third-party-database-tools.md %}).

### I/O timeout

The following error is most often caused by trying to connect to a cluster without [authorizing the right network]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network), not having an internet connection, or an issue in your application environment:

~~~
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp 35.196.33.161:26257: i/o timeout
Failed running "sql"
~~~

<h4>Solution</h4>

Check if you have internet access.

If you do have internet access, check if you have [authorized the right network]({% link cockroachcloud/connect-to-your-cluster.md %}#authorize-your-network):

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

You can find your host name in the CockroachDB {{ site.data.products.cloud }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters** and locating the **Host** field. If the error persists, [contact Support](https://support.cockroachlabs.com/).

### Connection refused

The following error is displayed if your cluster connection is dropped:

~~~
Error: dial tcp 35.240.101.1:26257: connect: connection refused
~~~

<h4>Solution</h4>

CockroachDB {{ site.data.products.cloud }} connections can occasionally become invalid due to upgrades, restarts, or other disruptions. Your application should use a [pool of persistent connections]({% link {{site.current_cloud_version}}/connection-pooling.md %}) and connection retry logic to ensure that connections remain current. See the [Production Checklist]({% link cockroachcloud/production-checklist.md %}) for more information.

## Security errors

### Incorrect certs path

The following error is displayed if the directory path for the CA certificate is incorrect:

~~~
Error: open test-cluster-ca.crt: no such file or directory
Failed running "sql"
~~~

<h4>Solution</h4>

Check the directory path for the [CA certificate in the connection method]({% link cockroachcloud/connect-to-your-cluster.md %}#connect-to-your-cluster). If you have downloaded multiple CA certificates, check that you are using the right one.

### Issue with CockroachDB workloads

The following error is displayed while trying to a run [CockroachDB workload]({% link {{site.current_cloud_version}}/cockroach-workload.md %}) with `sslmode=verify-full`:

~~~
Error: x509: certificate signed by unknown authority
~~~

<h4>Solution</h4>

This is a known issue. Use `sslmode=require` instead.

{{site.data.alerts.callout_info}}
Using `sslmode=require` can leave your cluster vulnerable to MITM and impersonation attacks. For more information, see PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.
{{site.data.alerts.end}}

## CockroachDB {{ site.data.products.serverless }}

### Delayed cluster access

To enhance security, CockroachDB {{ site.data.products.serverless }} uses authentication throttling tracked per proxy and per (client IP, serverless cluster) pair. This means if multiple login attempts fail on the same client to the same cluster (for example, due to repeated incorrect passwords or brute force attacks), access is temporarily delayed, with the wait time increasing after each attempt (up to an hour).

<h4>Solution</h4>

If you are experiencing access issues, ensure that the password is correct. If the problem persists, [contact support](https://support.cockroachlabs.com/).

### Hanging or stuck queries

A hanging or stuck query using CockroachDB {{ site.data.products.serverless }} may be caused by reaching the cluster's configured [resource limits]({% link cockroachcloud/plan-your-cluster-serverless.md %}#choose-resource-limits) for [Request Units]({% link cockroachcloud/plan-your-cluster-serverless.md %}#request-units) or storage space. SQL Statements and `cockroach` CLI commands may be impacted. You can check your cluster's resource limits and status from the [**Cluster Overview** page]({% link cockroachcloud/cluster-overview-page.md %}) in the Cloud Console. Resource limits are displayed in **Usage this month**. If you've used all your storage, your cluster will be labeled **THROTTLED**, and you will be limited to a single SQL connection which you can use to delete data. If you've used all your RUs, your cluster will be **DISABLED**.

<h4>Solution</h4>

If you've reached your storage or RU limit, you can [increase your resource limits]({% link cockroachcloud/serverless-cluster-management.md %}#edit-cluster-capacity) and then re-run the query.

If you've only reached your RU limit, you can wait until the next billing cycle when [monthly free RUs]({% link cockroachcloud/plan-your-cluster-serverless.md %}#free-vs-paid-usage) become available and then re-run the query.
