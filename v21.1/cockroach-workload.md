---
title: cockroach workload
summary: Use cockroach workload to run a load generator against a CockroachDB cluster.
toc: true
---

CockroachDB comes with built-in load generators for simulating different types of client workloads, printing per-operation statistics and totals after a specific duration or max number of operations. To run one of these load generators, use the `cockroach workload` [command](cockroach-commands.html) as described below.

{{site.data.alerts.callout_danger}}
The `cockroach workload` command is experimental. The interface and output are subject to change.
{{site.data.alerts.end}}

## Synopsis

Create the schema for a workload:

~~~ shell
$ cockroach workload init <workload> <flags> '<connection string>'
~~~

Run a workload:

~~~ shell
$ cockroach workload run <workload> <flags> '<connection string>'
~~~

View help:

~~~ shell
$ cockroach workload --help
~~~
~~~ shell
$ cockroach workload init --help
~~~
~~~ shell
$ cockroach workload init <workload> --help
~~~
~~~ shell
$ cockroach workload run --help
~~~
~~~ shell
$ cockroach workload run <workload> --help
~~~

## Subcommands

Command | Usage
--------|------
`init` | Load the schema for the workload. You run this command once for a given schema.
`run` | Run a workload. You can run this command multiple times from different machines to increase concurrency. See [Concurrency](#concurrency) for more details.

## Concurrency

There are two ways to increase the concurrency of a workload:

- **Increase the concurrency of a single workload instance** by running `cockroach workload run <workload>` with the `--concurrency` flag set to a value higher than the default. Note that not all workloads support this flag.
- **Run multiple instances of a workload in parallel** by running `cockroach workload run <workload>` multiple times from different terminals/machines.  

## Workloads

Workload | Description
---------|------------
[`bank`](#bank-workload) | Models a set of accounts with currency balances.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
[`intro`](#intro-and-startrek-workloads) | Loads an `intro` database, with one table, `mytable`, with a hidden message.<br><br>For this workload, you run only `workload init` to load the data. The `workload run` subcommand is not applicable.
[`kv`](#kv-workload) | Reads and writes to keys spread (by default, uniformly at random) across the cluster.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
[`movr`](#movr-workload) |   Simulates a workload for the [MovR example application](movr.html).<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
[`startrek`](#intro-and-startrek-workloads) | Loads a `startrek` database, with two tables, `episodes` and `quotes`.<br><br>For this workload, you run only `workload init` to load the data. The `workload run` subcommand is not applicable.
[`tpcc`](#tpcc-workload) | Simulates a transaction processing workload using a rich schema of multiple tables.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
[`ycsb`](#ycsb-workload) | Simulates a high-scale key value workload, either read-heavy, write-heavy, or scan-based, with additional customizations.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.

{{site.data.alerts.callout_info}}
 `cockroach workload` sets the [`application_name`](set-vars.html#supported-variables) for its workload queries to the name of the workload that is used. You can filter queries on `application_name` on the [Statements page of the DB Console](ui-statements-page.html#search-and-filter-by-application), or in a [`SHOW QUERIES`](show-queries.html#filter-for-specific-queries) statement.
{{site.data.alerts.end}}

## Flags

{{site.data.alerts.callout_info}}
The `cockroach workload` command does not support connection or security flags like other [`cockroach` commands](cockroach-commands.html). Instead, you must use a [connection string](connection-parameters.html) at the end of the command.
{{site.data.alerts.end}}

### `bank` workload

Flag | Description
-----|------------
`--concurrency` | The number of concurrent workers.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** 2 * number of CPUs
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `bank`
`--display-every` | The frequency for printing per-operation statistics. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1s`
`--display-format` | The format for printing per-operation statistics (`simple`, `incremental-json`). When using `incremental-json`, note that totals are not printed at the end of the workload's duration.<br><br>**Applicable command:** `run`<br>**Default:** `simple`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`. For the `run` command, this flag must be used in conjunction with `--init`.
`--duration` | The duration to run, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `0`, which means run forever.
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | **Deprecated.** Use the `init` command instead.<br><br>**Applicable command:** `run`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--payload-bytes` | The size of the payload field in each initial row.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `100`
`--ramp` | The duration over which to ramp up load.<br><br>**Applicable command:** `run`
`--ranges` | The initial number of ranges in the `bank` table.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `10`
`--rows` | The initial number of accounts in the `bank` table.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1000`
`--seed` | The key hash seed.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--tolerate-errors` | Keep running on error.<br><br>**Applicable command:** `run`

### `intro` and `startrek` workloads

{{site.data.alerts.callout_info}}
These workloads generate data but do not offer the ability to run continuous load. Thus, only the `init` subcommand is supported.
{{site.data.alerts.end}}

Flag | Description
-----|------------
`--drop` | Drop the existing database, if it exists, before loading the dataset.


### `kv` workload

Flag | Description
-----|------------
`--batch` | The number of blocks to insert in a single SQL statement.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--concurrency` | The number of concurrent workers.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `8`  `--cycle-length`| The number of keys repeatedly accessed by each writer.**Applicable commands:** `init` or `run`<br>**Default:** `9223372036854775807`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `kv`
`--display-every` | The frequency for printing per-operation statistics. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1s`
`--display-format` | The format for printing per-operation statistics (`simple`, `incremental-json`). When using `incremental-json`, note that totals are not printed at the end of the workload's duration.<br><br>**Applicable command:** `run`<br>**Default:** `simple`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`
`--duration` | The duration to run, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | **Deprecated.** Use the `init` command instead.<br><br>**Applicable command:** `run`
`--max-block-bytes` | The maximum amount of raw data written with each insertion.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `2`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--min-block-bytes` | The minimum amount of raw data written with each insertion.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--ramp` | The duration over which to ramp up load.<br><br>**Applicable command:** `run`
`--read-percent` | The percent (0-100) of operations that are reads of existing keys.<br><br>**Applicable commands:** `init` or `run`
`--seed` | The key hash seed.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--sequential` | Pick keys sequentially instead of randomly.<br><br>**Applicable commands:** `init` or `run`
`--splits` | The number of splits to perform before starting normal operations.<br><br>**Applicable commands:** `init` or `run`
`--tolerate-errors` | Keep running on error.<br><br>**Applicable command:** `run`
`--use-opt` | Use [cost-based optimizer](cost-based-optimizer.html).<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `true`
`--write-seq` | Initial write sequence value.<br><br>**Applicable commands:** `init` or `run`

### `movr` workload

Flag | Description
-----|------------
`--data-loader` | How to load initial table data. Valid options are `INSERT` and `IMPORT`.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `INSERT`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `movr`
`--display-every` | The frequency for printing per-operation statistics. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1s`
`--display-format` | The format for printing per-operation statistics (`simple`, `incremental-json`). When using `incremental-json`, note that totals are not printed at the end of the workload's duration.<br><br>**Applicable command:** `run`<br>**Default:** `simple`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`
`--duration` | The duration to run, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--histograms-max-latency` | Expected maximum latency of running a query, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1m40s`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--method` | The SQL issue method (`prepare`, `noprepare`, `simple`).<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `prepare`
`--num-histories` | The initial number of ride location histories.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1000`
`--num-promo-codes` | The initial number of promo codes.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1000`
`--num-rides` | Initial number of rides.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `500`
`--num-users` | Initial number of users.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `50`
`--num-vehicles` | Initial number of vehicles.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `15`
`--ramp` | The duration over which to ramp up load.<br><br>**Applicable command:** `run`
`--seed` | The random number generator seed.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--tolerate-errors` | Keep running on error.<br><br>**Applicable command:** `run`

### `tpcc` workload

Flag | Description
-----|------------
`--active-warehouses` | Run the load generator against a specific number of warehouses.<br><br>**Applicable commands:** `init` or `run`<br>**Defaults:** Value of `--warehouses`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `tpcc`
`--display-every` | The frequency for printing per-operation statistics. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1s`
`--display-format` | The format for printing per-operation statistics (`simple`, `incremental-json`). When using `incremental-json`, note that totals are not printed at the end of the workload's duration.<br><br>**Applicable command:** `run`<br>**Default:** `simple`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`. For the `run` command, this flag must be used in conjunction with `--init`.
`--duration` | The duration to run, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--fks` | Add foreign keys.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `true`
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | **Deprecated.** Use the `init` command instead.<br><br>**Applicable command:** `run`
`--interleaved` | Use [interleaved tables](interleave-in-parent.html).<br><br>**Applicable commands:** `init` or `run`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--mix` | Weights for the transaction mix.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `newOrder=10,payment=10,orderStatus=1,delivery=1,stockLevel=1`, which matches the [TPC-C specification](http://www.tpc.org/tpc_documents_current_versions/current_specifications.asp).
`--partition-affinity` | Run the load generator against a specific partition. This flag must be used in conjunction with `--partitions`.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `-1`
`--partitions` | Partition tables. This flag must be used in conjunction with `--split`.<br><br>**Applicable commands:** `init` or `run`
`--ramp` | The duration over which to ramp up load.<br><br>**Applicable command:** `run`
`--scatter` | Scatter ranges.<br><br>**Applicable commands:** `init` or `run`
`--seed` | The random number generator seed.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--serializable` | Force serializable mode. CockroachDB only supports `SERIALIZABLE` isolation, so this flag is not necessary.<br><br>**Applicable command:** `init`
`--split` | [Split tables](split-at.html).<br><br>**Applicable commands:** `init` or `run`
`--tolerate-errors` | Keep running on error.<br><br>**Applicable command:** `run`
`--wait` | Run in wait mode, i.e., include think/keying sleeps.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `true`
`--warehouses` | The number of warehouses for loading initial data, at approximately 200 MB per warehouse.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--workers` | The number of concurrent workers.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `--warehouses` * 10
`--zones` | The number of [replication zones](configure-replication-zones.html) for partitioning. This number should match the number of `--partitions` and the zones used to start the cluster.<br><br>**Applicable command:** `init`

### `ycsb` workload

Flag | Description
-----|------------
`--concurrency` | The number of concurrent workers.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `8`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `ycsb`
`--display-every` | The frequency for printing per-operation statistics. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `1s`
`--display-format` | The format for printing per-operation statistics (`simple`, `incremental-json`). When using `incremental-json`, note that totals are not printed at the end of the workload's duration.<br><br>**Applicable command:** `run`<br>**Default:** `simple`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`. For the `run` command, this flag must be used in conjunction with `--init`.
`--duration` | The duration to run, with a required time unit suffix. Valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)) are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--families` | Place each column in its own [column family](column-families.html).<br><br>**Applicable commands:** `init` or `run`
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | **Deprecated.** Use the `init` command instead.<br><br>**Applicable command:** `run`
`--initial-count` | Initial number of rows to sequentially insert before beginning random number generation.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `10000`
`--json` | Use JSONB rather than relational data.<br><br>**Applicable commands:** `init` or `run`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--method` | The SQL issue method (`prepare`, `noprepare`, `simple`).<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `prepare`
`--ramp` | The duration over which to ramp up load.<br><br>**Applicable command:** `run`
`--request-distribution` | Distribution for the random number generator (`zipfian`, `uniform`).<br><br>**Applicable commands:** `init` or `run`.<br>**Default:** `zipfian`
`--seed` | The random number generator seed.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `1`
`--splits` | Number of [splits](split-at.html) to perform before starting normal operations.<br><br>**Applicable commands:** `init` or `run`
`--tolerate-errors` | Keep running on error.<br><br>**Applicable command:** `run`
`--workload` | The type of workload to run (`A`, `B`, `C`, `D`, or `F`). For details about these workloads, see [YCSB Workloads](https://github.com/brianfrankcooper/YCSB/wiki/Core-Workloads).<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `B`

### Logging

By default, the `cockroach workload` command logs errors to `stderr`.

If you need to troubleshoot this command's behavior, you can change its [logging behavior](debug-and-error-logs.html).

## Examples

These examples assume that you have already [started an insecure cluster locally](start-a-local-cluster.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--listen-addr=localhost
~~~

### Run the `bank` workload

1. Load the initial schema:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init bank \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Run the workload for 1 minute:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run bank \
    --duration=1m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         1608.6         1702.2      4.5      7.3     12.6     65.0 transfer
          2s        0         1725.3         1713.8      4.5      7.9     13.1     19.9 transfer
          3s        0         1721.1         1716.2      4.5      7.3     11.5     21.0 transfer
          4s        0         1328.7         1619.2      5.5     10.5     17.8     39.8 transfer
          5s        0         1389.3         1573.3      5.2     11.5     16.3     23.1 transfer
          6s        0         1640.0         1584.4      5.0      7.9     12.1     16.3 transfer
          7s        0         1594.0         1585.8      5.0      7.9     10.5     15.7 transfer
          8s        0         1652.8         1594.2      4.7      7.9     11.5     29.4 transfer
          9s        0         1451.9         1578.4      5.2     10.0     15.2     26.2 transfer
         10s        0         1653.3         1585.9      5.0      7.6     10.0     18.9 transfer
    ...
    ~~~

    After the specified duration (1 minute in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
       60.0s        0          84457         1407.6      5.7      5.5     10.0     15.2    167.8
    ~~~

### Run the `kv` workload

1. Load the initial schema:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init kv \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Run the workload for 1 minute:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run kv \
    --duration=1m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         5095.8         5123.7      1.5      2.5      3.3      7.3 write
          2s        0         4795.4         4959.6      1.6      2.8      3.5      8.9 write
          3s        0         3456.5         4458.5      2.0      4.5      7.3     24.1 write
          4s        0         2787.9         4040.8      2.4      6.3     12.6     30.4 write
          5s        0         3558.7         3944.4      2.0      4.2      6.8     11.5 write
          6s        0         3733.8         3909.3      1.9      4.2      6.0     12.6 write
          7s        0         3565.6         3860.1      2.0      4.7      7.9     25.2 write
          8s        0         3469.3         3811.4      2.0      5.0      6.8     22.0 write
          9s        0         3937.6         3825.4      1.8      3.7      7.3     29.4 write
         10s        0         3822.9         3825.1      1.8      4.7      8.9     37.7 write
    ...
    ~~~

    After the specified duration (1 minute in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
       60.0s        0         276067         4601.0      1.7      1.6      3.1      5.2     96.5
    ~~~

### Load the `intro` dataset

1. Load the dataset:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init intro \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Launch the built-in SQL client to view it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM intro;
    ~~~

    ~~~
      table_name
    +------------+
      mytable
    (1 row)
    ~~~    

    {% include copy-clipboard.html %}
    ~~~ shell
    $ SELECT * FROM intro.mytable WHERE (l % 2) = 0;
    ~~~

    ~~~
      l  |                          v
    +----+------------------------------------------------------+
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

### Load the `startrek` dataset

1. Load the dataset:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init startrek \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Launch the built-in SQL client to view it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM startrek;
    ~~~

    ~~~
      table_name
    +------------+
      episodes
      quotes
    (2 rows)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM startrek.episodes WHERE stardate > 5500;
    ~~~

    ~~~
      id | season | num |               title               | stardate
    +----+--------+-----+-----------------------------------+----------+
      60 |      3 |   5 | Is There in Truth No Beauty?      |   5630.7
      62 |      3 |   7 | Day of the Dove                   |   5630.3
      64 |      3 |   9 | The Tholian Web                   |   5693.2
      65 |      3 |  10 | Plato's Stepchildren              |   5784.2
      66 |      3 |  11 | Wink of an Eye                    |   5710.5
      69 |      3 |  14 | Whom Gods Destroy                 |   5718.3
      70 |      3 |  15 | Let That Be Your Last Battlefield |   5730.2
      73 |      3 |  18 | The Lights of Zetar               |   5725.3
      74 |      3 |  19 | Requiem for Methuselah            |   5843.7
      75 |      3 |  20 | The Way to Eden                   |   5832.3
      76 |      3 |  21 | The Cloud Minders                 |   5818.4
      77 |      3 |  22 | The Savage Curtain                |   5906.4
      78 |      3 |  23 | All Our Yesterdays                |   5943.7
      79 |      3 |  24 | Turnabout Intruder                |   5928.5
    (14 rows)
    ~~~

### Load the `movr` dataset

1. Load the dataset:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Launch the built-in SQL client to view it:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --insecure
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SHOW TABLES FROM movr;
    ~~~

    ~~~
            table_name
+----------------------------+
  promo_codes
  rides
  user_promo_codes
  users
  vehicle_location_histories
  vehicles
(6 rows)
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM movr.users WHERE city='new york';
    ~~~

    ~~~
                   id                  |   city   |       name       |           address           | credit_card
+--------------------------------------+----------+------------------+-----------------------------+-------------+
  00000000-0000-4000-8000-000000000000 | new york | Robert Murphy    | 99176 Anderson Mills        | 8885705228
  051eb851-eb85-4ec0-8000-000000000001 | new york | James Hamilton   | 73488 Sydney Ports Suite 57 | 8340905892
  0a3d70a3-d70a-4d80-8000-000000000002 | new york | Judy White       | 18580 Rosario Ville Apt. 61 | 2597958636
  0f5c28f5-c28f-4c00-8000-000000000003 | new york | Devin Jordan     | 81127 Angela Ferry Apt. 8   | 5614075234
  147ae147-ae14-4b00-8000-000000000004 | new york | Catherine Nelson | 1149 Lee Alley              | 0792553487
(5 rows)
    ~~~

### Run the `movr` workload

1. Load the initial schema:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init movr \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Initialize and run the workload for 1 minute:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run movr \
    --duration=1m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
        1.0s        0           31.9           32.0      0.5      0.6      1.4      1.4 addUser
        1.0s        0            6.0            6.0      1.2      1.4      1.4      1.4 addVehicle
        1.0s        0           10.0           10.0      2.2      6.3      6.3      6.3 applyPromoCode
        1.0s        0            2.0            2.0      0.5      0.6      0.6      0.6 createPromoCode
        1.0s        0            9.0            9.0      0.9      1.6      1.6      1.6 endRide
        1.0s        0         1407.5         1407.8      0.3      0.5      0.7      4.1 readVehicles
        1.0s        0           27.0           27.0      2.1      3.1      4.7      4.7 startRide
        1.0s        0           86.8           86.9      4.7      8.4     11.5     15.2 updateActiveRides
        2.0s        0           26.0           29.0      0.5      1.1      1.4      1.4 addUser
        2.0s        0            8.0            7.0      1.2      2.8      2.8      2.8 addVehicle
        2.0s        0            2.0            6.0      2.6      2.8      2.8      2.8 applyPromoCode
        2.0s        0            0.0            1.0      0.0      0.0      0.0      0.0 createPromoCode
        2.0s        0            6.0            7.5      0.8      1.7      1.7      1.7 endRide
        2.0s        0         1450.4         1429.1      0.3      0.6      0.9      2.6 readVehicles
        2.0s        0           17.0           22.0      2.1      3.3      5.5      5.5 startRide
        2.0s        0           59.0           72.9      6.3     11.5     11.5     14.2 updateActiveRides
    ...
    ~~~

    After the specified duration (1 minute in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
       60.0s        0          85297         1421.6      0.7      0.3      2.6      7.1     30.4
    ~~~

### Run the `tpcc` workload

1. Load the initial schema and data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init tpcc \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Run the workload for 10 minutes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run tpcc \
    --duration=10m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         1443.4         1494.8      4.7      9.4     27.3     67.1 transfer
          2s        0         1686.5         1590.9      4.7      8.1     15.2     28.3 transfer
          3s        0         1735.7         1639.0      4.7      7.3     11.5     28.3 transfer
          4s        0         1542.6         1614.9      5.0      8.9     12.1     21.0 transfer
          5s        0         1695.9         1631.1      4.7      7.3     11.5     22.0 transfer
          6s        0         1569.2         1620.8      5.0      8.4     11.5     15.7 transfer
          7s        0         1614.6         1619.9      4.7      8.1     12.1     16.8 transfer
          8s        0         1344.4         1585.6      5.8     10.0     15.2     31.5 transfer
          9s        0         1351.9         1559.5      5.8     10.0     16.8     54.5 transfer
         10s        0         1514.8         1555.0      5.2      8.1     12.1     16.8 transfer
    ...
    ~~~

    After the specified duration (10 minutes in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
      600.0s        0         823902         1373.2      5.8      5.5     10.0     15.2    209.7
    ~~~

### Run the `ycsb` workload

1. Load the initial schema and data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init ycsb \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Run the workload for 10 minutes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run ycsb \
    --duration=10m \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    You'll see per-operation statistics print to standard output every second:

    ~~~
    _elapsed___errors__ops/sec(inst)___ops/sec(cum)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)
          1s        0         9258.1         9666.6      0.7      1.3      2.0      8.9 read
          1s        0          470.1          490.9      1.7      2.9      4.1      5.0 update
          2s        0        10244.6         9955.6      0.7      1.2      2.0      6.6 read
          2s        0          559.0          525.0      1.6      3.1      6.0      7.3 update
          3s        0         9870.8         9927.4      0.7      1.4      2.4     10.0 read
          3s        0          500.0          516.6      1.6      4.2      7.9     15.2 update
          4s        0         9847.2         9907.3      0.7      1.4      2.4     23.1 read
          4s        0          506.8          514.2      1.6      3.7      7.6     17.8 update
          5s        0        10084.4         9942.6      0.7      1.3      2.1      7.1 read
          5s        0          537.2          518.8      1.5      3.5     10.0     15.2 update
    ...
    ~~~

    After the specified duration (10 minutes in this case), the workload will stop and you'll see totals printed to standard output:

    ~~~
    _elapsed___errors_____ops(total)___ops/sec(cum)__avg(ms)__p50(ms)__p95(ms)__p99(ms)_pMax(ms)__result
      600.0s        0        4728286         7880.2      1.0      0.9      2.2      5.2    268.4
    ~~~  

### Customize the frequency and format of per-operation statistics

To customize the frequency of per-operation statistics, use the `--display-every` flag, with `ns`, `us`, `ms`, `s`, `m`, and `h` as valid [time units](https://en.wikipedia.org/wiki/Orders_of_magnitude_(time)). To customize the format of per-operation statistics, use the `--display-format` flag, with `incremental-json` or `simple` (default) as options.

1. Load the initial schema and data:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload init ycsb \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

2. Run the workload for 1 minute, printing the output every 5 seconds as JSON:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach workload run ycsb \
    --duration=1m \
    --display-every=5s \
    --display-format=incremental-json \
    'postgresql://root@localhost:26257?sslmode=disable'
    ~~~

    ~~~
    {"time":"2019-09-13T03:25:03.950621Z","errs":0,"avgt":8434.5,"avgl":8471.0,"p50l":0.8,"p95l":1.6,"p99l":3.1,"maxl":19.9,"type":"read"}
    {"time":"2019-09-13T03:25:03.950621Z","errs":0,"avgt":438.1,"avgl":440.0,"p50l":1.5,"p95l":2.8,"p99l":4.5,"maxl":14.7,"type":"update"}
    {"time":"2019-09-13T03:25:08.95061Z","errs":0,"avgt":7610.6,"avgl":8040.8,"p50l":0.8,"p95l":2.0,"p99l":4.2,"maxl":65.0,"type":"read"}
    {"time":"2019-09-13T03:25:08.95061Z","errs":0,"avgt":391.8,"avgl":415.9,"p50l":1.6,"p95l":3.5,"p99l":5.8,"maxl":21.0,"type":"update"}
    {"time":"2019-09-13T03:25:13.950727Z","errs":0,"avgt":7242.0,"avgl":7774.5,"p50l":0.8,"p95l":2.2,"p99l":4.7,"maxl":75.5,"type":"read"}
    {"time":"2019-09-13T03:25:13.950727Z","errs":0,"avgt":382.0,"avgl":404.6,"p50l":1.6,"p95l":4.7,"p99l":10.5,"maxl":24.1,"type":"update"}
    ...
    ~~~

    When using `incremental-json`, note that totals are not printed at the end of the workload's duration.

## See also

- [`cockroach demo`](cockroach-demo.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Performance Benchmarking with TPC-C](performance-benchmarking-with-tpcc-small.html)
