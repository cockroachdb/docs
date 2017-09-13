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

### Range limits per node

By default, the maximum size of a range is 64MiB. To manage a range on
a single node, CockroachDB needs:

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
to needs. We are also working on reducing the CPU overhead per range.

CockroachDB also supports changing the range size (e.g. to increase
it) but this is currently not fully tested. Different zones can use
different range sizes.

### Range limits across a cluster

To estimate the maximum number of ranges across an entire cluster, one
must consider:

- the replication factor;
- the maximum number of nodes;
- the *meta* ranges that index all the other ranges.

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

Meanwhile, CockroachDB uses a tree structure to index all ranges in a
cluster (so as to know on which node each range is present). The top
of the tree is a single range called "meta1", containing descriptors
to "meta2" ranges, containing descriptors to the data ranges.  A range
descriptor is about 100-200 bytes, so theoretically with 64MB ranges
meta1 can index ~550k meta2 ranges, and each meta2 range can index
~550k data ranges. This gives at the default range size a theoretical
maximum of 10PB capacity in a CockroachDB cluster.

However, CockroachDB v1.1 has a [known
limitation](https://github.com/cockroachdb/cockroach/issues/18032)
which prevents the creation of multiple meta2 ranges, so **until
CockroachDB v1.2 a cluster may become increasingly slower when using
more than ~550k data ranges in total: clusters with a capacity of
about 1TB or beyond will not operate at max performance.** This is
because the single meta2 range will be forced to grow beyond the
nominal maximum range size, which in turn has a performance penalty
throughout the cluster.

### Derived SQL schema limits

- Maximum number of databases = 2^63;
- Maximum number of tables = approx. maximum number of ranges or 2^63, whichever is smallest (but also see note below);
- Maximum number of indexes / FKs = approx. maximum number of ranges;
- Maximum number of indexes / FKs per table = maximum number of indexes or 2^63, whichever is smallest;
- Maximum number of rows in a single table = approx. maximum number of ranges, times the number of rows per range;
- Maximum number of rows per range = range size / minimum row size;
- Minimum number of rows per range = range size / maximum row size.

The maximum number of tables/views is a combination of the following limits:

- each table and database has a 63-bit numeric identifier.
- each non-interleaved table (not view) uses at least one range,
  because CockroachDB ensures that the data from two different
  non-interleaved tables never share a range. This implies the maximum
  number of tables is limited by the maximum number of ranges.
- in CockroachDB v1.1, all the table and view descriptors (metadata)
  are stored in a single range, which is duplicated in RAM across all
  the cluster. Table/view descriptors can have a variable size,
  depending on the schema definition and the number of schema changes
  over time. Assuming a descriptor size of around 1K, the nominal
  suggested maximum is thus about 64.000 tables/views (descriptors
  that fit in a range), although that range will be allowed to grow
  beyond the nominal maximum range size, albeit with a performance penalty.

### SQL Min/max row sizes

The minimum/maximum row size is decided by the types of the columns in
the table.

The documentation for each data type further details the data width of
values of that type.

Further limits apply:

- the combined size of all primary key values in a single row should
  fit within a few kilobytes. Although CockroachDB might support keys
  up to 8MB in size, which is [the maximum key size in the underlying
  RocksDB store](https://github.com/facebook/rocksdb/wiki/RocksDB-FAQ)
  on each node, keys larger than a few kilobytes will cause a
  significant decrease in CockroachDB performance.
- the combined sized of a row must fit within a fraction of the range
  size. We highly recommend this to be kept within 30% of the range
  size, although larger fractions may also work.

Hence, with the default configuration of 64MB, the maximum row size is
about 20MB.
