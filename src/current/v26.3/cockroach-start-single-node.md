---
title: cockroach start-single-node
summary: The cockroach start-single-node command starts a single-node cluster with replication disabled.
toc: true
docs_area: reference.cli
---

{% assign version = page.version.version | replace: ".", "" %}
{% assign single_node_cmd = site.data[version]["cockroach-commands"] | where: "command_id", "cockroach_start_single_node" | first %}

This page explains the `cockroach start-single-node` [command]({% link {{ page.version.version }}/cockroach-commands.md %}), which you use to start a single-node cluster with replication disabled. A single-node cluster is appropriate for quick SQL testing or app development.

{{site.data.alerts.callout_danger}}
A single-node cluster is not appropriate for use in production or for performance testing. To run a multi-node cluster with replicated data for availability, consistency and resiliency, including load balancing across multiple nodes, use [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) and [`cockroach init`]({% link {{ page.version.version }}/cockroach-init.md %}) to start a multi-node cluster with a minimum of three nodes instead.
{{site.data.alerts.end}}

## Synopsis

Start a single-node cluster:

~~~ shell
{{ single_node_cmd.synopsis.start }}
~~~

View help:

~~~ shell
{{ single_node_cmd.synopsis.view_help }}
~~~

## Flags

The `cockroach start-single-node` command supports the following [general-use](#general), [networking](#networking), [security](#security), and [logging](#logging) flags.

Many flags have useful defaults that can be overridden by specifying the flags explicitly. If you specify flags explicitly, however, be sure to do so each time the node is restarted, as they will not be remembered.

{{site.data.alerts.callout_info}}
The `cockroach start-single-node` flags are identical to [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}#flags) flags. However, many of them are not relevant for single-node clusters but are provided for users who want to test concepts that appear in multi-node clusters. These flags are called out as such. In most cases, accepting most defaults is sufficient (see the [examples](#examples) below).
{{site.data.alerts.end}}

### General

{% include {{ page.version.version }}/reference/flags-table.md flags=single_node_cmd.flags.general %}

### Networking

{% include {{ page.version.version }}/reference/flags-table.md flags=single_node_cmd.flags.networking %}

### Security

{% include {{ page.version.version }}/reference/flags-table.md flags=single_node_cmd.flags.security %}

### Store

The `--store` flag supports the following fields. Note that commas are used to separate fields, and so are forbidden in all field values.

{{site.data.alerts.callout_info}}
In-memory storage is not suitable for production deployments at this time.
{{site.data.alerts.end}}

{% include {{ page.version.version }}/reference/flags-table.md flags=single_node_cmd.flags.store %}

### Logging

By default, `cockroach start-single-node` writes all messages to log files, and prints nothing to `stderr`. This includes events with `INFO` [severity]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) and higher. However, you can [customize the logging behavior]({% link {{ page.version.version }}/configure-logs.md %}) of this command by using the `--log` flag:

{% include {{ page.version.version }}/misc/logging-flags.md %}

#### Defaults

See the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration).

## Docker-specific features of single-node clusters

When you use the `cockroach start-single-node` command to start a single-node cluster with Docker, some additional features are available to help with testing and development. Refer to [Start a local cluster in Docker (Linux)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-linux.md %}) and [Start a local cluster in Docker (macOS)]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %}).

## Standard output

When you run `cockroach start-single-node`, some helpful details are printed to the standard output:

~~~ shell
CockroachDB node starting at {{ now | date: "%Y-%m-%d %H:%M:%S.%6 +0000 UTC" }}
build:               CCL {{page.release_info.version}} @ {{ site.data.releases | where_exp: "release", "release.major_version == page.version.version" | where_exp: "release", "release.withdrawn != true" | sort: "release_date" | last | map: "release_date" | date: "%Y/%m/%d 12:34:56" }} {{ site.data.releases | where_exp: "release", "release.major_version == page.version.version" | where_exp: "release", "release.withdrawn != true" | sort: "release_date" | last | map: "go_version" }}
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
sql (JDBC):          jdbc:postgresql://localhost:26257/defaultdb?sslmode=disable&user=root
RPC client flags:    cockroach <client cmd> --host=localhost:26257 --insecure
logs:                /Users/<username>/node1/logs
temp dir:            /Users/<username>/node1/cockroach-temp242232154
external I/O path:   /Users/<username>/node1/extern
store[0]:            path=/Users/<username>/node1
status:              initialized new cluster
clusterID:           8a681a16-9623-4fc1-a537-77e9255daafd
nodeID:              1
~~~

{{site.data.alerts.callout_success}}
These details are also written to the `INFO` log in the `/logs` directory. You can retrieve them with a command like `grep 'node starting' node1/logs/cockroach.log -A 11`.
{{site.data.alerts.end}}

Field | Description
------|------------
{% for field in single_node_cmd.standard_output.fields -%}
`{{ field.field }}` | {{ field.description }}
{% endfor %}

## Examples

### Start a single-node cluster

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. Create two directories for certificates:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs my-safe-directory
    ~~~

    Directory | Description
    ----------|------------
    `certs` | You'll generate your CA certificate and all node and client certificates and keys in this directory.
    `my-safe-directory` | You'll generate your CA key in this directory and then reference the key when generating node and client certificates.

1. Create the CA (Certificate Authority) certificate and key pair:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-ca \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create the certificate and key pair for the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-node \
    localhost \
    $(hostname) \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Create a client certificate and key pair for the `root` user:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach cert create-client \
    root \
    --certs-dir=certs \
    --ca-key=my-safe-directory/ca.key
    ~~~

1. Start the single-node cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node \
    --certs-dir=certs \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="insecure">
<p></p>
{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach start-single-node \
--insecure \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080
~~~
</section>

### Scale to multiple nodes

Scaling a cluster started with `cockroach start-single-node` involves restarting the first node with the `cockroach start` command instead, and then adding new nodes with that command as well, all using a `--join` flag that forms them into a single multi-node cluster. Since replication is disabled in clusters started with `start-single-node`, you also need to enable replication to get CockroachDB's availability and consistency guarantees.

<section class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</section>

<section class="filter-content" markdown="1" data-scope="secure">
1. Stop the single-node cluster:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 19584     1   0  6:13PM ttys001    0:01.27 cockroach start-single-node --certs-dir=certs --listen-addr=localhost:26257 --http-addr=localhost:8080
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 19584
    ~~~

    ~~~
    initiating graceful shutdown of server
	server drained and shutdown completed
	~~~

1. Restart the node with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    The new flag to note is `--join`, which specifies the addresses and ports of the nodes that will initially comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

    {% include {{ page.version.version }}/prod-deployment/join-flag-single-region.md %}

1. In new terminal windows, add two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --certs-dir=certs \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags, since this all nodes are running on the same machine. Also, since all nodes use the same hostname (`localhost`), you can use the first node's certificate. Note that this is different than running a production cluster, where you would need to generate a certificate and key for each node, issued to all common names and IP addresses you might use to refer to the node as well as to any load balancer instances.

1. Open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=certs --host=localhost:26257
    ~~~

1. Update preconfigured [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) to replicate user data 3 times and import internal data 5 times:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER RANGE default CONFIGURE ZONE USING num_replicas = 3;
    ALTER DATABASE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE liveness CONFIGURE ZONE USING num_replicas = 5;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ~~~

</section>

<section class="filter-content" markdown="1" data-scope="insecure">
1. Stop the single-node cluster:

    Get the process ID of the node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ps -ef | grep cockroach | grep -v grep
    ~~~

    ~~~
      501 19584     1   0  6:13PM ttys001    0:01.27 cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080
    ~~~

    Gracefully shut down the node, specifying its process ID:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kill -TERM 19584
    ~~~

    ~~~
    initiating graceful shutdown of server
	server drained and shutdown completed
	~~~

1. Restart the node with the [`cockroach start`]({% link {{ page.version.version }}/cockroach-start.md %}) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --listen-addr=localhost:26257 \
    --http-addr=localhost:8080 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    The new flag to note is `--join`, which specifies the addresses and ports of the nodes that will comprise your cluster. You'll use this exact `--join` flag when starting other nodes as well.

1. In new terminal windows, add two more nodes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node2 \
    --listen-addr=localhost:26258 \
    --http-addr=localhost:8081 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach start \
    --insecure \
    --store=node3 \
    --listen-addr=localhost:26259 \
    --http-addr=localhost:8082 \
    --join=localhost:26257,localhost:26258,localhost:26259
    ~~~

    These commands are the same as before but with unique `--store`, `--listen-addr`, and `--http-addr` flags, since this all nodes are running on the same machine.

1. Open the [built-in SQL shell]({% link {{ page.version.version }}/cockroach-sql.md %}):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure --host=localhost:26257
    ~~~

1. Update preconfigured [replication zones]({% link {{ page.version.version }}/configure-replication-zones.md %}) to replicate user data 3 times and import internal data 5 times:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER RANGE default CONFIGURE ZONE USING num_replicas = 3;
    ALTER DATABASE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE meta CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE system CONFIGURE ZONE USING num_replicas = 5;
    ALTER RANGE liveness CONFIGURE ZONE USING num_replicas = 5;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE DISCARD;
    ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING gc.ttlseconds = 600, constraints = '[]', lease_preferences = '[]';
    ALTER TABLE system.public.tenant_usage CONFIGURE ZONE DISCARD;
ALTER TABLE system.public.tenant_usage CONFIGURE ZONE USING gc.ttlseconds = 7200, constraints = '[]', lease_preferences = '[]';
    ~~~

</section>

## See also

- Running a local multi-node cluster:
    - [From Binary]({% link {{ page.version.version }}/start-a-local-cluster.md %})
    - [In Docker]({% link {{ page.version.version }}/start-a-local-cluster-in-docker-mac.md %})
- Running a distributed multi-node cluster:
    - [From Binary]({% link {{ page.version.version }}/manual-deployment.md %})
    - [In Kubernetes]({% link {{ page.version.version }}/deploy-cockroachdb-with-kubernetes.md %})
- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
