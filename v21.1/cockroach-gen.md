---
title: cockroach gen
summary: Use cockroach gen to generate command-line interface utlities, such as man pages, and example data.
toc: true
redirect_from: generate-cockroachdb-resources.html
key: generate-cockroachdb-resources.html
---

The `cockroach gen` [command](cockroach-commands.html) can generate command-line interface (CLI) utilities ([`man` pages](https://en.wikipedia.org/wiki/Man_page) and a `bash` autocompletion script), example SQL data suitable to populate test databases, and an HAProxy configuration file for load balancing a running cluster.

## Subcommands

Subcommand | Usage
-----------|------
`man` | Generate man pages for CockroachDB.
`autocomplete` | Generate `bash` or `zsh` autocompletion script for CockroachDB.<br><br>**Default:** `bash`
`example-data` | Generate example SQL datasets. You can also use the [`cockroach workload`](cockroach-workload.html) command to generate these sample datasets in a persistent cluster and the [`cockroach demo <dataset>`](cockroach-demo.html) command to generate these datasets in a temporary, in-memory cluster.
`haproxy` | Generate an HAProxy config file for a running CockroachDB cluster. The node addresses included in the config are those advertised by the nodes. Make sure hostnames are resolvable and IP addresses are routable from HAProxy.<br><br> [Decommissioned nodes](remove-nodes.html) are excluded from the config file.

## Synopsis

Generate man pages:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen man
~~~

Generate bash autocompletion script:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen autocomplete
~~~

Generate example SQL data:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data intro | cockroach sql
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data startrek | cockroach sql
~~~

Generate an HAProxy config file for a running cluster:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy
~~~

View help:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen --help
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen man --help
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen autocomplete --help
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data --help
~~~

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy --help
~~~

## Flags

The `gen` subcommands supports the following [general-use](#general), [logging](#logging), and [client connection](#client-connection) flags.

### General

#### `man`

Flag | Description
-----|-----------
`--path` | The path where man pages will be generated.<br><br>**Default:** `man/man1` under the current directory

#### `autocomplete`

Flag | Description
-----|-----------
`--out` | The path where the autocomplete file will be generated.<br><br>**Default:** `cockroach.bash` in the current directory

#### `example-data`

No flags are supported. See the [Generate Example Data](#generate-example-data) example for guidance.

#### `haproxy`

Flag | Description
-----|------------
`--host` | The server host and port number to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost:26257`
`--port`<br>`-p` | The server port to connect to. Note: The port number can also be specified via `--host`. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`
`--insecure` | Use an insecure connection.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--certs-dir` | The path to the [certificate directory](cockroach-cert.html) containing the CA and client certificates and client key.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--url` | A [connection URL](connection-parameters.html#connect-using-a-url) to use instead of the other arguments.<br><br>**Env Variable:** `COCKROACH_URL`<br>**Default:** no URL
`--out` | The path where the `haproxy.cfg` file will be generated. If an `haproxy.cfg` file already exists in the directory, it will be overwritten.<br><br>**Default:** `haproxy.cfg` in the current directory
`--locality` | If nodes were started with [locality](cockroach-start.html#locality) details, you can use the `--locality` flag here to filter the nodes included in the HAProxy config file, specifying the explicit locality tier(s) or a regular expression to match against. This is useful in cases where you want specific instances of HAProxy to route to specific nodes. See the [Generate an HAProxy configuration file](#generate-an-haproxy-config-file) example for more details.

### Logging

By default, the `gen` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

### Client Connection

#### `haproxy`

Flag | Description
-----|------------
`--cluster-name` | The cluster name to use to verify the cluster's identity. If the cluster has a cluster name, you must include this flag. For more information, see [`cockroach start`](cockroach-start.html#general).
`--disable-cluster-name-verification` | Disables the cluster name check for this command. This flag must be paired with `--cluster-name`. For more information, see [`cockroach start`](cockroach-start.html#general).

## Examples

### Generate `man` pages

Generate man pages:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen man
~~~

Move the man pages to the man directory:

{% include copy-clipboard.html %}
~~~ shell
$ sudo mv man/man1/* /usr/share/man/man1
~~~

Access man pages:

{% include copy-clipboard.html %}
~~~ shell
$ man cockroach
~~~

### Generate a `bash` autocompletion script

Generate bash autocompletion script:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen autocomplete
~~~

Add the script to your `.bashrc` and `.bash_profle`:

{% include copy-clipboard.html %}
~~~ shell
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bashrc
~~~

{% include copy-clipboard.html %}
~~~ shell
$ printf "\n\n#cockroach bash autocomplete\nsource '<path to>cockroach.bash'" >> ~/.bash_profile
~~~

You can now use `tab` to autocomplete `cockroach` commands.

### Generate example data

{{site.data.alerts.callout_success}}
You can also use the [`cockroach workload`](cockroach-workload.html) command to generate these sample datasets in a persistent cluster and the [`cockroach demo <dataset>`](cockroach-demo.html) command to generate these datasets in a temporary, in-memory cluster.
{{site.data.alerts.end}}

To test out CockroachDB, you can generate an example `startrek` database, which contains 2 tables, `episodes` and `quotes`.

First, start up [a demo cluster](cockroach-demo.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach demo
~~~

Then, pipe the output from `cockroach gen` to [the URL to the demo cluster](cockroach-demo.html#connection-parameters):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data startrek | cockroach sql --url='postgres://demo:pass@127.0.0.1:55531?sslmode=require'
~~~

~~~
CREATE DATABASE
SET
DROP TABLE
DROP TABLE
CREATE TABLE
INSERT 1
...
CREATE TABLE
INSERT 1
...
~~~

Open a [SQL shell](cockroach-sql.html) to view it:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --url='postgres://demo:pass@127.0.0.1:55531?sslmode=require'
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM startrek;
~~~
~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  public      | episodes   | table |                  79
  public      | quotes     | table |                 200
(2 rows)
~~~

You can also generate an example `intro` database, which contains 1 table, `mytable`, with a hidden message:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen example-data intro | cockroach sql --url='postgres://demo:pass@127.0.0.1:55531?sslmode=require'
~~~

~~~
CREATE DATABASE
SET
DROP TABLE
CREATE TABLE
INSERT 1
INSERT 1
INSERT 1
INSERT 1
...
~~~

{% include copy-clipboard.html %}
~~~ shell
# Launch the built-in SQL client to view it:
$ cockroach sql --url='postgres://demo:pass@127.0.0.1:55531?sslmode=require'
~~~

{% include copy-clipboard.html %}
~~~ sql
> SHOW TABLES FROM intro;
~~~

~~~
  schema_name | table_name | type  | estimated_row_count
--------------+------------+-------+----------------------
  public      | mytable    | table |                  42
(1 row)
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM intro.mytable WHERE (l % 2) = 0;
~~~

~~~
  l  |                          v
-----+-------------------------------------------------------
   0 | !__aaawwmqmqmwwwaas,,_        .__aaawwwmqmqmwwaaa,,
   2 | !"VT?!"""^~~^"""??T$Wmqaa,_auqmWBT?!"""^~~^^""??YV^
   4 | !                    "?##mW##?"-
   6 | !  C O N G R A T S  _am#Z??A#ma,           Y
   8 | !                 _ummY"    "9#ma,       A
  10 | !                vm#Z(        )Xmms    Y
  12 | !              .j####mmm#####mm#m##6.
  14 | !   W O W !    jmm###mm######m#mmm##6
  16 | !             ]#me*Xm#m#mm##m#m##SX##c
  18 | !             dm#||+*$##m#mm#m#Svvn##m
  20 | !            :mmE=|+||S##m##m#1nvnnX##;     A
  22 | !            :m#h+|+++=Xmm#m#1nvnnvdmm;     M
  24 | ! Y           $#m>+|+|||##m#1nvnnnnmm#      A
  26 | !  O          ]##z+|+|+|3#mEnnnnvnd##f      Z
  28 | !   U  D       4##c|+|+|]m#kvnvnno##P       E
  30 | !       I       4#ma+|++]mmhvnnvq##P`       !
  32 | !        D I     ?$#q%+|dmmmvnnm##!
  34 | !           T     -4##wu#mm#pw##7'
  36 | !                   -?$##m####Y'
  38 | !             !!       "Y##Y"-
  40 | !
(21 rows)
~~~

### Generate an HAProxy config file

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster.

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="secure">
To generate an HAProxy config file for an entire secure cluster, run the `cockroach gen haproxy` command, specifying the location of [certificate directory](cockroach-cert.html) and the address of any instance running a CockroachDB node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--certs-dir=<path to certs directory> \
--host=<address of any node in the cluster>
~~~

To limit the HAProxy config file to nodes matching specific ["localities"](cockroach-start.html#locality), use the `--localities` flag, specifying the explicit locality tier(s) or a regular expression to match against:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--certs-dir=<path to certs directory> \
--host=<address of any node in the cluster>
--locality=region=us.*
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
To generate an HAProxy config file for an entire insecure cluster, run the `cockroach gen haproxy` command, specifying the address of any instance running a CockroachDB node:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=<address of any node in the cluster>
~~~

To limit the HAProxy config file to nodes matching specific ["localities"](cockroach-start.html#locality), use the `--localities` flag, specifying the explicit locality tier(s) or a regular expression to match against:

{% include copy-clipboard.html %}
~~~ shell
$ cockroach gen haproxy \
--insecure \
--host=<address of any node in the cluster>
--locality=region=us.*
~~~
</div>

By default, the generated configuration file is called `haproxy.cfg` and looks as follows, with the `server` addresses pre-populated correctly:

~~~
global
  maxconn 4096

defaults
    mode                tcp
    # Timeout values should be configured for your specific use.
    # See: https://cbonte.github.io/haproxy-dconv/1.8/configuration.html#4-timeout%20connect
    timeout connect     10s
    timeout client      1m
    timeout server      1m
    # TCP keep-alive on client side. Server already enables them.
    option              clitcpka

listen psql
    bind :26257
    mode tcp
    balance roundrobin
    option httpchk GET /health?ready=1
    server cockroach1 <node1 address>:26257 check port 8080
    server cockroach2 <node2 address>:26257 check port 8080
    server cockroach3 <node3 address>:26257 check port 8080
~~~

The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

Field | Description
------|------------
`timeout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is likely already being used by the CockroachDB node.
`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
`option httpchk` | The HTTP endpoint that HAProxy uses to check node health. [`/health?ready=1`](monitoring-and-alerting.html#health-ready-1) ensures that HAProxy doesn't direct traffic to nodes that are live but not ready to receive requests.
`server` | For each included node, this field specifies the address the node advertises to other nodes in the cluster, i.e., the addressed pass in the [`--advertise-addr` flag](cockroach-start.html#networking) on node startup. Make sure hostnames are resolvable and IP addresses are routable from HAProxy.

{{site.data.alerts.callout_info}}
For full details on these and other configuration settings, see the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html).
{{site.data.alerts.end}}

## See also

- [Other Cockroach Commands](cockroach-commands.html)
- [Deploy CockroachDB On-Premises](deploy-cockroachdb-on-premises.html) (using HAProxy for load balancing)
