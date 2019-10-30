---
title: Troubleshoot CockroachCloud
summary: The SQL Users page displays a list of SQL users who can access the cluster.
toc: true
build_for: [cockroachcloud]
---

This page describes common CockroachCloud errors and their solutions.

## Connection errors

### Wrong connection string

The following error is displayed on the terminal if you use the incorrect connection string while trying to connect to a cluster:

~~~ shell
Error: x509: certificate signed by unknown authority
Failed running "sql"
~~~

**Solution:** Check the [connection string](cockroachcloud-connect-to-your-cluster.html#step-3-generate-the-connection-string) to make sure you are using the right one for your cluster.

### Network not authorized

The following error is displayed on the terminal while trying to connect to a cluster without [authorizing the right network](cockroachcloud-connect-to-your-cluster.html#step-1-authorize-your-network) or if there is no internet connection:

~~~ shell
Is the server running?
If the server is running, check --host client-side and --advertise server-side.

dial tcp 35.196.33.161:26257: i/o timeout
Failed running "sql"
~~~

**Solution:**
Check if you have internet access.

If you do have internet access, check if you have authorized the right network:

- In a development environment, you need to authorize your application server’s network and your local machine’s network. If you change your location, you need to authorize the new location’s network, or else the connection from that network will be rejected.
- In a production environment, you need to authorize your application server’s network.

## Security errors

The following error is displayed while trying to a run [CockroachDB workload](https://www.cockroachlabs.com/docs/stable/cockroach-workload.html) with `sslmode=verify-full`:

~~~ shell
Error: x509: certificate signed by unknown authority
~~~

**Solution:** This is a known issue. Use `sslmode=require` instead.
