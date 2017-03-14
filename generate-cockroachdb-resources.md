---
title: Generate CockroachDB Resources
summary: Use cockroach gen to generate command-line interface utlities, such as man pages, and example data.
toc: false
---

The `cockroach gen` command can generate command-line interface (CLI) utilities ([`man` pages](https://en.wikipedia.org/wiki/Man_page) and a`bash` autocompletion script), example SQL data suitable to populate test databases, and an HAProxy configuration file for load balancing a running cluster.

<div id="toc"></div>

## Subcommands

| Subcommand | Usage |
| -----------|------ |
| `man` | Generate man pages for CockroachDB. |
| `autocomplete` | Generate bash autocompletion script for CockroachDB. |
| `example-data` | Generate example SQL data. |
| `haproxy` | Generate an HAProxy config file for a running CockroachDB cluster. |

## Synopsis

~~~ shell
# Generate man pages:
$ cockroach gen man

# Generate bash autocompletion script:
$ cockroach gen autocomplete

# Generate example SQL data:
$ cockroach gen example-data | cockroach sql

# Generate an HAProxy config file for a running cluster:
$ cockroach gen haproxy

# View help:
$ cockroach gen --help
$ cockroach gen man --help
$ cockroach gen autocomplete --help
$ cockroach gen example-data --help
$ cockroach gen haproxy --help
~~~

## Flags

The `gen` subcommands support the following flags, as well as [logging flags](cockroach-commands.html#logging-flags).

### `man`

Flag | Description
-----|-----------
`--path` | The path where man pages will be generated.<br><br>**Default:** `man/man1` under the current directory

### `autocomplete`

Flag | Description
-----|-----------
`--out` | The path where the autocomplete file will be generated.<br><br>**Default:** `cockroach.bash` in the current directory

### `example-data`

No flags are supported. See the [Generate Example Data](#generate-example-data) example for guidance.

### `haproxy`

Flag | Description
-----|-----------
`--ca-cert` | The path to the [CA certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CA_CERT`
`--cert` | The path to the [client certificate](create-security-certificates.html). This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_CERT`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Set this only if the cluster is insecure and running on multiple machines.<br><br>If the cluster is insecure and local, leave this out. If the cluster is secure, leave this out and set the `--ca-cert`, `--cert`, and `-key` flags.<br><br>**Env Variable:** `COCKROACH_INSECURE`
`--key` | The path to the [client key](create-security-certificates.html) protecting the client certificate. This flag is required if the cluster is secure.<br><br>**Env Variable:** `COCKROACH_KEY`
`--out` | The path where the HAProxy config file will be generated.<br><br>**Default:** `haproxy.cfg` in the current directory
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

## Examples

### Generate `man` Pages

~~~ shell
# Generate man pages:
$ cockroach gen man

# Move the man pages to the man directory:
$ sudo mv man/man1/* /usr/share/man/man1

# Access man pages:
$ man cockroach
~~~

### Generate a `bash` Autocompletion Script

~~~ shell
# Generate bash autocompletion script:
$ cockroach gen autocomplete

# Add the script to your .bashrc and .bash_profle:
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bashrc
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bash_profile
~~~

You can now use `tab` to autocomplete `cockroach` commands.

### Generate Example Data

To test out CockroachDB, you can generate an example database, `startrek`, that contains 2 tables, `episodes` and `quotes`.

~~~ shell
# Generate example SQL data:
$ cockroach gen example-data | cockroach sql

# Launch the built-in SQL client to view it:
$ cockroach sql
~~~
~~~ sql
> SHOW TABLES FROM startrek;
~~~
~~~
+----------+
|  Table   |
+----------+
| episodes |
| quotes   |
+----------+
~~~

{{site.data.alerts.callout_success}}You can find example databases by using <code>cockroach gen example-data --help</code>.{{site.data.alerts.end}}

### Generate an HAProxy Configuration File

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster.

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="secure">
To generate an HAProxy config file for a secure cluster, run the `cockroach gen haproxy` command, specifying the address of any instance running a CockroachDB node and [security flags](create-security-certificates.html) pointing to the CA cert and the client cert and key:

~~~ shell
$ cockroach gen haproxy \
--host=<address of any node in the cluster> \
--port=26257 \
--ca-cert=certs/ca.cert \
--cert=certs/root.cert \
--key=certs/root.key
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
To generate an HAProxy config file for an insecure cluster, run the `cockroach gen haproxy` command, specifying the address of any instance running a CockroachDB node:

~~~ shell
$ cockroach gen haproxy \
--host=<address of any node in the cluster> \
--port=26257 \
--insecure
~~~
</div>

By default, the generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated correctly:

~~~ shell
global
  maxconn 4096

defaults
    mode                tcp
    timeout connect     10s
    timeout client      1m
    timeout server      1m

listen psql
    bind :26257
    mode tcp
    balance roundrobin
    server cockroach1 <node1 address>:26257
    server cockroach2 <node2 address>:26257
    server cockroach3 <node3 address>:26257
~~~

The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

Field | Description
------|------------
`timout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is also used for inter-node communication.
`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
`server` | For each node in the cluster, this field specifies the interface that the node listens on, i.e., the address passed in the `--host` or `--advertise-host` flag on node startup.

For more details about these and other configuration settings, see the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html).

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Manual Deployment](manual-deployment.html) (using HAProxy for load balancing)
