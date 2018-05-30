---
title: Enable User Authentication
summary: Learn how to enable user authentication for secure clusters for the Admin UI.
toc: false
---

By default, CockroachDB allows all users to access and view the Admin UI. For added security, you can choose to enable user authentication so that only authorized users can access and view the Admin UI.

{{site.data.alerts.callout_info}}User authentication can be enabled only for secure clusters. {{site.data.alerts.end}}

<div id="toc"></div>

### Step 1. Start a secure cluster with the user authentication environment variable set for each node:

To start a secure cluster, first [create security certificates](secure-a-cluster.html#step-1-create-security-certificates).

Then set the environment variable, `COCKROACH_EXPERIMENTAL_REQUIRE_WEB_LOGIN=TRUE`, while [starting each node](secure-a-cluster.html#step-2-start-the-first-node) in the cluster:

{% include copy-clipboard.html %}
~~~ shell
$ COCKROACH_EXPERIMENTAL_REQUIRE_WEB_LOGIN=TRUE \
  ./cockroach start --host=<node1 hostname> --certs-dir=certs
~~~

Finally, [initialize the cluster](initialize-a-cluster.html).

### Step 2. Create a user with a password

[Use the built-in SQL client](use-the-built-in-sql-client.html) to [create a user with a password](create-user.html). Usernames are case-insensitive; must start with either a letter or underscore; must contain only letters, numbers, or underscores; and must be between 1 and 63 characters.

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER <username> WITH PASSWORD '<password>';
~~~

For secure clusters, you must also [create their client certificates](create-security-certificates.html).

### Step 3. Access the Admin UI using the user credentials
You can access the Admin UI from any node in the cluster.

By default, you can access it via HTTP on port `8080` of the hostname or IP address you configured using the `--host` flag while [starting the node](https://www.cockroachlabs.com/docs/stable/start-a-node.html#general). For example, `https://<any node host>:8080`.

You can also set the CockroachDB Admin UI to a custom port using `--http-port` or a custom hostname using `--http-host` when [starting each node](start-a-node.html). For example, if you set both a custom port and hostname, `https://<http-host value>:<http-port value>`.

On accessing the Admin UI, the Login screen is displayed. Enter the username and password for the user created in the previous step.
