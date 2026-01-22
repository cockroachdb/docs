---
title: cockroach debug pebble db analyze-data
summary: Learn how to analyze Pebble data to compare compression algorithms and output results as a CSV file.
toc: true
docs_area: reference.cli
---

The `cockroach debug pebble db analyze-data` [command]({% link {{ page.version.version }}/cockroach-commands.md %}) samples data blocks from Pebble files in a store directory and runs compression experiments. The command writes results to a CSV file for analysis.

{{site.data.alerts.callout_info}}
This command reads data files from disk and can generate noticeable disk I/O and CPU load. When running it on a node that is serving production traffic, we recommend throttling read bandwidth using [`--read-mb-per-sec`](#flags).
{{site.data.alerts.end}}

## Subcommands

{% include {{ page.version.version }}/misc/debug-subcommands.md %}

## Synopsis

~~~
$ cockroach debug pebble db analyze-data {dir} {flags}
~~~

## Flags

The `debug pebble db analyze-data` subcommand supports the following flags.

Flag | Description
-----|------------
`--comparer` | Comparer name (use default if empty).
`--merger` | Merger name (use default if empty).
`--output` | Path for the output CSV file.
`--read-mb-per-sec` | Limits read I/O bandwidth to avoid disrupting running workloads (`0` = no limit). Recommended range is between `1` (1 MiB) and `10` (10 MiB).<br /><br />**Default:** `0`
`--sample-percent` | Percentage of data to sample before stopping.<br /><br />**Default:** `100`
`--timeout` | Stop after this much time has passed (`0` = no timeout).<br /><br />**Default:** `0`

## Details

### Use cases

Use this command to collect real-world compression statistics for a [store]({% link {{ page.version.version }}/cockroach-start.md %}#store)'s data, such as:

- Estimated compression ratios across supported algorithms and levels.
- Estimated compression and decompression CPU costs.

This data can help Cockroach Labs evaluate compression defaults and can help you evaluate whether an alternate compression algorithm is appropriate for your workload.

### Where to run

- On a node's [store directory]({% link {{ page.version.version }}/cockroach-start.md %}#store): You can run this command alongside a live CockroachDB node's process. The command does not communicate with the process, but it can compete for disk bandwidth and CPU.
- On a representative subset of nodes: For large clusters, you typically do not need to run this command on every node. You can also run it on one node for a period of time, and then on another node.
- On a backup directory: You can run this command against a backup directory (specified [the same way it would be with `BACKUP`]({% link {{ page.version.version }}/use-cloud-storage.md %})). This can be much less disruptive than running it on nodes with an active workload.

### Output behavior

The output CSV file is periodically rewritten while the command is running. Even if the command is interrupted, you can still use the most recently written output.

## Examples

### View help output

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug pebble db analyze-data --help
~~~

~~~
Sample blocks from the files in the database directory to run compression
experiments and produce a CSV file of the results.

Usage:
  cockroach debug pebble db analyze-data <dir> [flags]

Flags:
      --comparer string       comparer name (use default if empty)
  -h, --help                  help for analyze-data
      --merger string         merger name (use default if empty)
      --output string         path for the output CSV file
      --read-mb-per-sec int   limit read IO bandwidth (default 0 = no limit)
      --sample-percent int    percentage of data to sample (default 100%) (default 100)
      --timeout duration      stop after this much time has passed (default 0 = no timeout)
~~~

### Analyze a store directory with throttled reads

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug pebble db analyze-data /tmp/node0 --read-mb-per-sec=5 --output ~/Desktop/analyze-a-store-directory-with-throttled-reads.csv
~~~

~~~
Listing files and sizes...
Found 4 files, total size 2.4MB.
Limiting read bandwidth to 5.0MB/s.

Kind  Size Range  Test CR  Samples  Size                 Snappy          MinLZ1          Zstd1            Auto1/30         Auto1/15         Zstd3
data  24-48KB     1.5-2.5  39       31.2KB ± 2%  CR      1.96 ± 13%      1.99 ± 14%      2.41 ± 15%       2.03 ± 17%       2.28 ± 17%       2.50 ± 15%
                                                 Comp    917MBps ± 31%   1476MBps ± 32%  432MBps ± 15%    980MBps ± 87%    596MBps ± 46%    263MBps ± 19%
                                                 Decomp  2161MBps ± 28%  3351MBps ± 31%  802MBps ± 13%    3331MBps ± 69%   1219MBps ± 47%   863MBps ± 13%
data  24-48KB     >2.5     608      31.1KB ± 2%  CR      10.75 ± 36%     24.15 ± 54%     26.46 ± 52%      24.33 ± 54%      25.14 ± 52%      27.65 ± 48%
                                                 Comp    2935MBps ± 81%  4607MBps ± 87%  1106MBps ± 65%   3036MBps ± 129%  1912MBps ± 106%  973MBps ± 79%
                                                 Decomp  4169MBps ± 50%  5614MBps ± 64%  2067MBps ± 319%  5310MBps ± 76%   3791MBps ± 89%   2732MBps ± 68%

Sampled 4 files, 2.4MB (100.00%)
~~~

### Limit the amount of data sampling

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug pebble db analyze-data /tmp/node1 --sample-percent=10 --output ~/Desktop/limit-the-amount-of-sampling.csv
~~~

~~~
Listing files and sizes...
Found 4 files, total size 2.4MB.
No read bandwidth limiting.
Stopping after sampling 10% of the data.

Kind  Size Range  Test CR  Samples  Size                 Snappy          MinLZ1          Zstd1            Auto1/30         Auto1/15         Zstd3
data  24-48KB     1.5-2.5  33       31.0KB ± 2%  CR      1.97 ± 16%      1.98 ± 15%      2.42 ± 18%       1.98 ± 15%       2.40 ± 19%       2.54 ± 19%
                                                 Comp    1012MBps ± 32%  1708MBps ± 32%  466MBps ± 17%    1427MBps ± 72%   530MBps ± 28%    272MBps ± 18%
                                                 Decomp  2331MBps ± 31%  3744MBps ± 32%  845MBps ± 12%    4240MBps ± 30%   964MBps ± 23%    849MBps ± 14%
data  24-48KB     >2.5     617      30.9KB ± 2%  CR      10.69 ± 37%     24.06 ± 55%     26.38 ± 51%      24.09 ± 54%      25.15 ± 52%      27.57 ± 48%
                                                 Comp    2881MBps ± 84%  4519MBps ± 91%  1106MBps ± 69%   3422MBps ± 129%  1718MBps ± 101%  991MBps ± 80%
                                                 Decomp  4087MBps ± 50%  5112MBps ± 57%  2084MBps ± 314%  5048MBps ± 62%   3339MBps ± 86%   2641MBps ± 69%

Sampled 1 files, 2.2MB (93.75%)
~~~

### Stop after a fixed duration

{% include_cached copy-clipboard.html %}
~~~ shell
$ cockroach debug pebble db analyze-data /tmp/node2 --timeout=1m --output ~/Desktop/stop-after-a-fixed-duration.csv
~~~

~~~
Listing files and sizes...
Found 4 files, total size 2.4MB.
No read bandwidth limiting.
Stopping after 1m0s.

Kind  Size Range  Test CR  Samples  Size                 Snappy          MinLZ1          Zstd1            Auto1/30         Auto1/15        Zstd3
data  24-48KB     1.5-2.5  39       31.0KB ± 2%  CR      1.94 ± 16%      2.02 ± 13%      2.45 ± 16%       2.02 ± 13%       2.28 ± 19%      2.54 ± 18%
                                                 Comp    973MBps ± 31%   1503MBps ± 35%  443MBps ± 18%    1440MBps ± 95%   683MBps ± 57%   269MBps ± 17%
                                                 Decomp  2249MBps ± 30%  3418MBps ± 31%  806MBps ± 18%    3836MBps ± 30%   1385MBps ± 57%  849MBps ± 12%
data  24-48KB     >2.5     619      30.8KB ± 2%  CR      10.70 ± 37%     24.35 ± 56%     26.71 ± 52%      24.42 ± 56%      25.73 ± 53%     27.86 ± 49%
                                                 Comp    2930MBps ± 82%  4581MBps ± 89%  1120MBps ± 66%   3401MBps ± 122%  1765MBps ± 96%  998MBps ± 78%
                                                 Decomp  4277MBps ± 52%  5235MBps ± 58%  2138MBps ± 329%  5267MBps ± 58%   3485MBps ± 81%  2730MBps ± 68%

Sampled 4 files, 2.4MB (100.00%)
~~~

## See also

- [`cockroach` Commands Overview]({% link {{ page.version.version }}/cockroach-commands.md %})
- [Troubleshooting Overview]({% link {{ page.version.version }}/troubleshooting-overview.md %})
