---
title: Run a Sample Workload
summary: Use cockroach workload to run a load generator against a CockroachDB cluster.
toc: true
---

<span class="version-tag">New in v2.1:</span> CockroachDB comes with built-in load generators for simulating different types of client workloads, printing out per-operation statistics every second and totals after a specific duration or max number of operations. To run one of these load generators, use the `cockroach workload` [command](cockroach-commands.html) as described below.

{{site.data.alerts.callout_danger}}
The `cockroach workload` command is experimental. The interface and output are subject to change.
{{site.data.alerts.end}}

## Synopsis

~~~ shell
# Create the schema for a workload:
$ cockroach workload init <workload> <flags> '<connection string>'

# Run a workload:
$ cockroach workload run <workload> <flags> '<connection string>'

# View help:
$ cockroach workload --help
$ cockroach workload init --help
$ cockroach workload init <workload> --help
$ cockroach workload run --help
$ cockroach workload run <workload> --help
~~~

## Subcommands

Command | Usage
--------|------
`init` | Load the schema for the workload. You run this command once for a given schema.
`run` | Run a workload. You can run this command multiple times from different machines to increase concurrency. See [Concurrency](#concurrency) for more details.

## Concurrency

There are two ways to increase the concurrency of a workload:

- **Increase the concurrency of a single workload instance** by running `cockroach workload run <workload>` with the `--concurrency` flag set to a value higher than the default.
- **Run multiple instances of a workload in parallel** by running `cockroach workload run <workload>` multiple times from different machines.  

## Workloads

Workload | Description
---------|------------
`bank` | Models a set of accounts with currency balances.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
`intro` | Loads an `intro` database, with one table, `mytable`, with a hidden message.<br><br>For this workload, you run only `workload init` to load the data. The `workload run` subcommand is not applicable.
`kv` | Reads and writes to keys spread (by default, uniformly at random) across the cluster.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.
`startrek` | Loads a `startrek` database, with two tables, `episodes` and `quotes`.<br><br>For this workload, you run only `workload init` to load the data. The `workload run` subcommand is not applicable.
`tpcc` | Simulates a transaction processing workload using a rich schema of multiple tables.<br><br>For this workload, you run `workload init` to load the schema and then `workload run` to generate data.

## Flags

{{site.data.alerts.callout_info}}
The `cockroach workload` command does not support connection or security flags like other [`cockroach` commands](cockroach-commands.html). Instead, you must use a [connection string](connection-parameters.html) at the end of the command.
{{site.data.alerts.end}}

### `bank` workload

Flag | Description
-----|------------
`--concurrency` | The number of concurrent workers.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `8`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `bank`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`. For the `run` command, this flag must be used in conjunction with `--init`.
`--duration` | The duration to run, with a required time unit suffix. Valid time units are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `0`, which means run forever.
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | Automatically run the `init` command.<br><br>**Applicable command:** `run`
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
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`
`--duration` | The duration to run, with a required time unit suffix. Valid time units are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | Automatically run the `init` command.<br><br>**Applicable command:** `run`
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

### `tpcc` workload

Flag | Description
-----|------------
`--active-warehouses` | Run the load generator against a specific number of warehouses.<br><br>**Applicable commands:** `init` or `run`<br>**Defaults:** Value of `--warehouses`
`--db` | The SQL database to use.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `tpcc`
`--drop` | Drop the existing database, if it exists.<br><br>**Applicable commands:** `init` or `run`. For the `run` command, this flag must be used in conjunction with `--init`.
`--duration` | The duration to run, with a required time unit suffix. Valid time units are `ns`, `us`, `ms`, `s`, `m`, and `h`.<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means run forever.
`--fks` | Add foreign keys.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `true`
`--histograms` | The file to write per-op incremental and cumulative histogram data to.<br><br>**Applicable command:** `run`
`--init` | Automatically run the `init` command.<br><br>**Applicable command:** `run`
`--interleaved` | Use [interleaved tables](interleave-in-parent.html).<br><br>**Applicable commands:** `init` or `run`
`--max-ops` | The maximum number of operations to run.<br><br>**Applicable command:** `run`
`--max-rate` | The maximum frequency of operations (reads/writes).<br><br>**Applicable command:** `run`<br>**Default:** `0`, which means unlimited.
`--mix` | Weights for the transaction mix.<br><br>**Applicable commands:** `init` or `run`<br>**Default:** `newOrder=10,payment=10,orderStatus=1,delivery=1,stockLevel=1`, which matches the [TPC-C specification](http://tpc.org/tpc_documents_current_versions/current_specifications5.asp).
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

## See also

- [`cockroach demo`](cockroach-demo.html)
- [Other Cockroach Commands](cockroach-commands.html)
- [Performance Benchmarking with TPC-C](performance-benchmarking-with-tpc-c.html)
