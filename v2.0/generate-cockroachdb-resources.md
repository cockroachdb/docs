---
title: Generate CockroachDB Resources
summary: Use cockroach gen to generate command-line interface utlities, such as man pages, and example data.
toc: true
---

The `cockroach gen` command can generate command-line interface (CLI) utilities ([`man` pages](https://en.wikipedia.org/wiki/Man_page) and a`bash` autocompletion script), example SQL data suitable to populate test databases, and an HAProxy configuration file for load balancing a running cluster.


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
$ cockroach gen example-data intro | cockroach sql
$ cockroach gen example-data startrek | cockroach sql

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

The `gen` subcommands supports the following [general-use](#general) and [logging](#logging) flags.

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
-----|-----------
`--certs-dir` | The path to the [certificate directory](create-security-certificates.html). The directory must contain valid certificates if running in secure mode.<br><br>**Env Variable:** `COCKROACH_CERTS_DIR`<br>**Default:** `${HOME}/.cockroach-certs/`
`--host` | The server host to connect to. This can be the address of any node in the cluster. <br><br>**Env Variable:** `COCKROACH_HOST`<br>**Default:** `localhost`
`--insecure` | Run in insecure mode. If this flag is not set, the `--certs-dir` flag must point to valid certificates.<br><br>**Env Variable:** `COCKROACH_INSECURE`<br>**Default:** `false`
`--out` | The path where the `haproxy.cfg` file will be generated. If an `haproxy.cfg` file already exists in the directory, it will be overwritten.<br><br>**Default:** `haproxy.cfg` in the current directory
`--port`<br>`-p` | The server port to connect to. <br><br>**Env Variable:** `COCKROACH_PORT`<br>**Default:** `26257`

### Logging

By default, the `gen` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

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

To test out CockroachDB, you can generate an example `startrek` database, which contains 2 tables, `episodes` and `quotes`.

~~~ shell
# Generate example `startrek` database:
$ cockroach gen example-data startrek | cockroach sql --insecure
~~~

~~~
CREATE DATABASE
SET
DROP TABLE
DROP TABLE
CREATE TABLE
INSERT 79
CREATE TABLE
INSERT 200
~~~

~~~ shell
# Launch the built-in SQL client to view it:
$ cockroach sql --insecure
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
(2 rows)
~~~

You can also generate an example `intro` database, which contains 1 table, `mytable`, with a hidden message:

~~~ shell
# Generate example `intro` database:
$ cockroach gen example-data intro | cockroach sql --insecure
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

~~~ shell
# Launch the built-in SQL client to view it:
$ cockroach sql --insecure
~~~

~~~ sql
> SHOW TABLES FROM intro;
~~~

~~~
+---------+
|  Table  |
+---------+
| mytable |
+---------+
(1 row)
~~~

~~~ sql
> SELECT * FROM intro.mytable WHERE (l % 2) = 0;
~~~

~~~
+----+------------------------------------------------------+
| l  |                          v                           |
+----+------------------------------------------------------+
|  0 | !__aaawwmqmqmwwwaas,,_        .__aaawwwmqmqmwwaaa,,  |
|  2 | !"VT?!"""^~~^"""??T$Wmqaa,_auqmWBT?!"""^~~^^""??YV^  |
|  4 | !                    "?##mW##?"-                     |
|  6 | !  C O N G R A T S  _am#Z??A#ma,           Y         |
|  8 | !                 _ummY"    "9#ma,       A           |
| 10 | !                vm#Z(        )Xmms    Y             |
| 12 | !              .j####mmm#####mm#m##6.                |
| 14 | !   W O W !    jmm###mm######m#mmm##6                |
| 16 | !             ]#me*Xm#m#mm##m#m##SX##c               |
| 18 | !             dm#||+*$##m#mm#m#Svvn##m               |
| 20 | !            :mmE=|+||S##m##m#1nvnnX##;     A        |
| 22 | !            :m#h+|+++=Xmm#m#1nvnnvdmm;     M        |
| 24 | ! Y           $#m>+|+|||##m#1nvnnnnmm#      A        |
| 26 | !  O          ]##z+|+|+|3#mEnnnnvnd##f      Z        |
| 28 | !   U  D       4##c|+|+|]m#kvnvnno##P       E        |
| 30 | !       I       4#ma+|++]mmhvnnvq##P`       !        |
| 32 | !        D I     ?$#q%+|dmmmvnnm##!                  |
| 34 | !           T     -4##wu#mm#pw##7'                   |
| 36 | !                   -?$##m####Y'                     |
| 38 | !             !!       "Y##Y"-                       |
| 40 | !                                                    |
+----+------------------------------------------------------+
(21 rows)
~~~

### Generate an HAProxy Configuration File

[HAProxy](http://www.haproxy.org/) is one of the most popular open-source TCP load balancers, and CockroachDB includes a built-in command for generating a configuration file that is preset to work with your running cluster.

<div class="filters clearfix">
  <button style="width: 15%" class="filter-button" data-scope="secure">Secure</button>
  <button style="width: 15%" class="filter-button" data-scope="insecure">Insecure</button>
</div><p></p>

<div class="filter-content" markdown="1" data-scope="secure">
To generate an HAProxy config file for a secure cluster, run the `cockroach gen haproxy` command, specifying the location of [certificate directory](create-security-certificates.html) and the address of any instance running a CockroachDB node:

~~~ shell
$ cockroach gen haproxy \
--certs-dir=<path to certs directory> \
--host=<address of any node in the cluster> \
--port=26257
~~~
</div>

<div class="filter-content" markdown="1" data-scope="insecure">
To generate an HAProxy config file for an insecure cluster, run the `cockroach gen haproxy` command, specifying the address of any instance running a CockroachDB node:

~~~ shell
$ cockroach gen haproxy --insecure \
--host=<address of any node in the cluster> \
--port=26257
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
    server cockroach1 <node1 address>:26257
    server cockroach2 <node2 address>:26257
    server cockroach3 <node3 address>:26257
~~~

The file is preset with the minimal [configurations](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html) needed to work with your running cluster:

Field | Description
------|------------
`timeout connect`<br>`timeout client`<br>`timeout server` | Timeout values that should be suitable for most deployments.
`bind` | The port that HAProxy listens on. This is the port clients will connect to and thus needs to be allowed by your network configuration.<br><br>This tutorial assumes HAProxy is running on a separate machine from CockroachDB nodes. If you run HAProxy on the same machine as a node (not recommended), you'll need to change this port, as `26257` is likely already being used by the CockroachDB node.
`balance` | The balancing algorithm. This is set to `roundrobin` to ensure that connections get rotated amongst nodes (connection 1 on node 1, connection 2 on node 2, etc.). Check the [HAProxy Configuration Manual](http://cbonte.github.io/haproxy-dconv/1.7/configuration.html#4-balance) for details about this and other balancing algorithms.
`option httpchk` | The HTTP endpoint that HAProxy uses to check node health. [`/health?ready=1`](monitoring-and-alerting.html#health-ready-1) ensures that HAProxy doesn't direct traffic to nodes that are live but not ready to receive requests.
`server` | For each node in the cluster, this field specifies the interface that the node listens on, i.e., the address passed in the `--host` flag on node startup.

{{site.data.alerts.callout_info}}For full details on these and other configuration settings, see the <a href="http://cbonte.github.io/haproxy-dconv/1.7/configuration.html">HAProxy Configuration Manual</a>.{{site.data.alerts.end}}

## See Also

- [Other Cockroach Commands](cockroach-commands.html)
- [Deploy CockroachDB On-Premises](deploy-cockroachdb-on-premises.html) (using HAProxy for load balancing)
