---
title: Troubleshoot CockroachDB Cloud
summary: The SQL Users page displays a list of SQL users who can access the cluster.
toc: true
docs_area: manage
---

This page describes common {{ site.data.products.db }} errors and their solutions.

{{site.data.alerts.callout_danger}}
We have updated the CA certificate used by {{ site.data.products.serverless }} clusters. If you downloaded this certificate prior to June 17, 2021, **you must [download the updated certificate](connect-to-a-serverless-cluster.html#step-2-connect-to-your-cluster) by September 30, 2021** to avoid disruptions to your service.
{{site.data.alerts.end}}

## Connection errors

### Wrong cluster name in the connection string

The following error is displayed on the terminal if you use a wrong cluster name in the connection string while trying to connect to a cluster:

~~~ shell
Error: x509: certificate signed by unknown authority
Failed running "sql"
~~~

**Solution:** Check if you are using the right cluster name in the [connection method](connect-to-your-cluster.html#step-3-connect-to-your-cluster). You can find your cluster name in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection string** and locating the parameter `cluster={cluster-name}` in your connection string.

### Invalid cluster name in a third-party tool

The following error is displayed if you try to connect to a [third-party tool](../stable/third-party-database-tools.html) with the wrong cluster or database name. The actual error message may vary depending on your tool:

~~~ shell
FATAL: CodeParamsRoutingFailed: rejected by BackendConfigFromParams: Invalid cluster name
~~~

**Solution**: Check that you are using the correct cluster and database names. You can find these parameters in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters**. For most tools, the full name of your database should be in the format `<routing-id>.<database>` for {{ site.data.products.serverless }} clusters.

For connection examples with your tool, see [these examples](../stable/third-party-database-tools.html).

### I/O timeout

The following error is most often caused by trying to connect to a cluster without [authorizing the right network](connect-to-your-cluster.html#step-1-authorize-your-network), not having an internet connection, or an issue in your application environment:

~~~
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp 35.196.33.161:26257: i/o timeout
Failed running "sql"
~~~

**Solution:**

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

~~~ shell
ERROR: cannot dial server.
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp: lookup gcp-us-east4.crdb.io: no such host
Failed running "sql"
~~~

**Solution:**
Check if you are using the correct host name.

You can find your host name in the {{ site.data.products.db }} Console by navigating to **Cluster Overview** > **Connect** > **Step 2. Connect** > **Connection parameters** and locating the **Host** field. If the error persists, [contact Support](https://support.cockroachlabs.com/).

### Connection refused

The following error may be displayed if your cluster connection is dropped:

~~~ shell
Error: dial tcp 35.240.101.1:26257: connect: connection refused
~~~

**Solution:**
{{ site.data.products.db }} connections can occasionally become invalid due to upgrades, restarts, or other disruptions. Your application should use a [pool of persistent connections](../{{site.versions["stable"]}}/connection-pooling.html) and connection retry logic to ensure that connections remain current. See the [Production Checklist](production-checklist.html) for more information.

### External network access disabled

The following error is displayed if you try to access cloud storage from an organization without billing information on file:

~~~ shell
ERROR: external network access is disabled
~~~

**Solution:**
You must [set up billing information](billing-management.html) for your organization to use cloud storage. If you don't have a credit card on file, you will be limited to `userfile` storage for [bulk operations](run-bulk-operations.html).

## Security errors

### Incorrect certs path

The following error is displayed if the directory path for the CA certificate is incorrect:

~~~ shell
Error: open test-cluster-ca.crt: no such file or directory
Failed running "sql"
~~~

**Solution**: Check the directory path for the [CA certificate in the connection method](connect-to-your-cluster.html#step-3-connect-to-your-cluster). If you have downloaded multiple CA certificates, check that you are using the right one.

### Issue with CockroachDB workloads

The following error is displayed while trying to a run [CockroachDB workload](../{{site.versions["stable"]}}/cockroach-workload.html) with `sslmode=verify-full`:

~~~ shell
Error: x509: certificate signed by unknown authority
~~~

**Solution:** This is a known issue. Use `sslmode=require` instead.

{{site.data.alerts.callout_info}}
Using `sslmode=require` can leave your cluster vulnerable to MITM and impersonation attacks. For more information, see PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.
{{site.data.alerts.end}}
