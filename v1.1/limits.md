---
title: Production limits
summary: How to estimate the maximum capacity of a CockroachDB cluster
toc: true
---

<div id="toc"></div>


### Introduction

The limits in CockroachDB are all based around the notion of *range*.

For example, the maximum amount of data that can be stored in a
CockroachDB cluster is directly related to the maximum number of
ranges and the maximum size of a range, and the maximum size of a row
in a table is limited by the size of a single range, as described
below.

In order to frame the various limits that typically matter to
application developers and architects, one must consider the range
limits first. The other limits are derived from that afterwards.

### Range limits

By default, the maximum size of a range is 64MiB. To manage a range,
CockroachDB needs:

- 64MiB on disk,
- some amount of RAM, a few kilobytes per range at a minimum,
- some amount of CPU time for background per-range management tasks.

The maximum number of ranges per node is thus limited by disk space,
RAM size and CPU time available when idle (no queries). In practice,
given that disk space is rather cheap, the practical number of ranges
per node is constrained by RAM size and CPU time.

For example, in our test clusters with 8 cores per node, 16GB of RAM,
and unlimited disk space, we observe a practical limit of about 50.000
ranges per node (3.2TB per node). Our experiments suggest the
bottleneck is currently on CPU time. A higher capacity per node can
thus be reached by increasing CPU core counts and RAM size according
to needs.

To estimate the maximum number of ranges across an entire cluster, one
must consider the replication factor and the maximum number of nodes.

The replication factor is configurable per zone, and is set to 3 by
default.

The maximum number of nodes is theoretically large. Currently
Cockroach Labs continuously tests clusters of 10 nodes, and regularly
clusters of 30 to 130 nodes. We aim to support more nodes eventually
(thousands).

For example, with 10 nodes and a replication factor of 3 and a maximum
of 50.000 ranges per node, there can be about 170.000 ranges in the
cluster (about 10TB). This limit can be increased further by
increasing resources per node (as described above) and increasing the
number of nodes.

CockroachDB also supports changing the range size (e.g. to increase
it) but this is currently not fully tested. Different zones can use
different range sizes.

### Derived SQL schema limits

- Maximum number of databases = 2^63
- Maximum number of tables = approx. maximum number of ranges or 2^63, whichever is smallest
- Maximum number of indexes / FKs = approx. maximum number of ranges
- Maximum number of indexes / FKs per table = maximum number of indexes or 2^63, whichever is smallest
- Maximum number of rows in a single table = approx. maximum number of ranges, times the number of rows per range
- Maximum number of rows per range = range size / minimum row size
- Minimum number of rows per range = range size / maximum row size

### SQL Min/max row sizes

The minimum/maximum row size is decided by the types of the columns in
the table.

The documentation for each data type further details the data width of
values of that type.

Further limits apply:

- the combined size of all primary key values in a single row must fit
  within 16KB. This is the maximum key size in the underlying RocksDB
  store on each node.
- the combined sized of a row must fit within a fraction of the range
  size. We highly recommend this to be kept within 30% of the range
  size, although larger fractions may also work.

Hence, with the default configuration of 64MB, the maximum row size is
about 20MB.
