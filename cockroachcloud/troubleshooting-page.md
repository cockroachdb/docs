---
title: Troubleshoot CockroachCloud
summary: The SQL Users page displays a list of SQL users who can access the cluster.
toc: true
---

This page describes common CockroachCloud errors and their solutions.

## Connection errors

### Wrong cluster name in the connection string

The following error is displayed on the terminal if you use a wrong cluster name in the connection string while trying to connect to a cluster:

~~~ shell
Error: x509: certificate signed by unknown authority
Failed running "sql"
~~~

**Solution:** Check if you are using the right cluster name in the [connection method](connect-to-your-cluster.html#step-4-connect-to-your-cluster).

### Network not authorized

The following error is displayed on the terminal while trying to connect to a cluster without [authorizing the right network](connect-to-your-cluster.html#step-1-authorize-your-network) or if there is no internet connection:

~~~ shell
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

You can find your host name in the CockroachCloud Console by navigating to **Cluster Overview** > **Connect** > **Connection parameters** and locating the **Host** field. If the error persists, [contact Support](https://support.cockroachlabs.com/).

### Application with a short timeout fails to connect

~~~ shell
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp 35.196.33.161:26257: i/o timeout
Failed running "sql"
~~~

**Solution:**

- Increase the timeout value (e.g., from 5 seconds to 30 seconds) and see if connection succeeds.
- If you can connect and run the same query in the SQL CLI, investigate your application environment.
- Investigate your network infrastructure to see if there is a network related performance problem, or [contact support](https://support.cockroachlabs.com/) with these details.

## Security errors

### Incorrect certs path

The following error is displayed if the directory path for the CA certificate is incorrect:

~~~ shell
Error: open test-cluster-ca.crt: no such file or directory
Failed running "sql"
~~~

**Solution**: Check the directory path for the [CA certificate in the connection method](connect-to-your-cluster.html#step-4-connect-to-your-cluster). If you have downloaded multiple CA certificates, check that you are using the right one.

### Issue with CockroachDB workloads

The following error is displayed while trying to a run [CockroachDB workload](../{{site.versions["stable"]}}/cockroach-workload.html) with `sslmode=verify-full`:

~~~ shell
Error: x509: certificate signed by unknown authority
~~~

**Solution:** This is a known issue. Use `sslmode=require` instead.

{{site.data.alerts.callout_info}}
Using `sslmode=require` can leave your cluster vulnerable to MITM and impersonation attacks. For more information, see PostgreSQL's [SSL Support](https://www.postgresql.org/docs/9.4/libpq-ssl.html) document.
{{site.data.alerts.end}}
