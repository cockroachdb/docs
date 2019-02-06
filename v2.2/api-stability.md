---
title: API Stability
summary: Stability commitment of various APIs throughout the lifecycle of CockroachDB.
toc: true
---

CockroachDB exposes multiple interfaces to users and client
applications. This page enumerates these interfaces and provides
indications about stability across CockroachDB releases for each of
them.

<div id="toc"></div>

## Overview of the stability guarantees

The [CockroachDB external
interfaces](#cockroachdb-external-interfaces) are classified into
**public and programmable** parts, **public and non-programmable**
parts and **reserved** parts.

### Public and programmable interfaces

These interfaces are meant for interfacing with third party automated
tools.

For example, the output of a `SELECT` query is public and
programmable.

For these interfaces, an app/client that works with major version N is expected
to work with all minor versions. Compatibility with version N+1 and
later depends on the stability phase, as detailed below in section
[Stability phases for public and programmable
interfaces](#stability-phases-for-public-and-programmable-interfaces).

Additionally, the CockroachDB team commits to documenting these
interfaces over time, and/or upon request.

### Public and non-programmable interfaces

These interfaces are meant to be consumed by humans and
are not suitable for automation.

For example, the output of SQL `SHOW` statements
is public but non-programmable.

For these interfaces, the stability guarantees are as follows:

- the particular data format of the inputs and outputs may change across minor
  versions, although the CockroachDB team will make some effort to avoid this;
- the particular data format of the inputs and outputs are likely to change
  across major versions.

These interfaces may not be documented, but can be incidentally
explained on-demand by the CockroachDB team during discussions on
public forums or during troubleshooting sessions. Users are invited
to reuse this knowledge.

### Reserved interfaces

These interfaces are meant for use by CockroachDB developers and are not
suitable for use, neither in automation by 3rd parties, nor by external documentation
that aims to remain relevant across CockroachDB versions.

For example, the contents of the `crdb_internal` SQL virtual schema is
a reserved interface.

For these, the stability guarantees are as follows:

- the particular data format of inputs or outputs may change between
  minor versions or patch releases.
- there is no expectation of accurate or up-to-date documentation.

## Stability phases for public and programmable interfaces

New features or behavior changes in public/programmable interfaces are
typically released first in status “experimental” then goes to “beta”
then evolves to “stable”.

Unless specified otherwise, a new feature that appears in version N in
a public interface, and is documented, should be considered as “beta”
until version N+1, where it can be assumed to have become “stable”.

The stability guarantees are as follows:

| Guarantee                                                                         | Experimental | Beta              | Stable                   |
|-----------------------------------------------------------------------------------|--------------|-------------------|--------------------------|
| Client/app built on version N.X works on version N.X+1 (minor releases)           | No guarantee | Yes (best effort) | Yes                      |
| Client/app built on version N works on version N+1 with only configuration change | No guarantee | Yes (best effort) | Yes                      |
| Client/app built on version N works on version N+1 without any changes            | No guarantee | No guarantee      | Yes (see below)          |
| Client/app built on version N works on version N+2 with only configuration change | No guarantee | No guarantee      | Yes (see below)          |
| Client/app built on version N works on version N+2 without any changes            | No guarantee | No guarantee      | Yes (see below)          |

Generally, the CockroachDB team will attempt to preserve compatibility
with existing CockroachDB apps built on version N with versions N+1,
N+2 and further. There are four main exceptions to this rule however:

| Situation in “stable” phase of major version N | Earliest version where change can occur, if backward-compatible with existing apps | Earliest version where change can occur, when backward-incompatible |
|------------------------------------------------|------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Implementation errors (bugs)                   | N.(X+1)                                                                            | N.(X+1) or N+1 depending on severity                                |
| Compatibility with PostgreSQL                  | N.(X+1)                                                                            | N.(X+1) opt-in<br>N+1 opt-out<br>N+2  definitive                    |
| Architectural changes                          | N+1                                                                                | N+2                                                                 |
| Product evolution                              | N+1                                                                                | N+2                                                                 |


### Implementation errors

If a public interface misbehaves in a way
that's blatantly against expectations, this may be fixed
in a subsequent minor release (N.X vs N.X+1).

For example, the check for SQL access privileges (security), or the
output of a SQL built-in function on edge case inputs, can be
corrected across minor releases.

The CockroachDB team will work (via testing) to ensure that existing
clients/tools are not negatively impacted by bug fixes; however
there will be no consideration for tooling built expressely to rely
on blatantly mis-behaving interfaces.

### Compatibility with PostgreSQL

If a feature combines the following properties:

- It is supported both by CockroachDB and PostgreSQL.
- Its interface is programmable.
- Its behavior differs between CockroachDB and PostgreSQL.
- There are well-known or sufficiently-widely used 3rd party apps built for PostgreSQL which do not react well to the CockroachDB behavior.
- Changing CockroachDB to become more alike to PostgreSQL will not be overly disruptive to existing CockroachDB-specific apps.

Then, CockroachDB will be evolved to adopt the PostgreSQL
behavior. This may occur in the next minor release if there is a way
to make the change invisible to existing CockroachDB apps. This will
occur at the latest in version N+2 if the change also requires
changing existing CockroachDB apps. In between, the compatibility may
be adjustable with session variables or cluster settings.

For example, the rules to derive data types for intermediate
results in complex SQL scalar expressions may evolve in this way.

### Architectural changes

If a feature is based off an architectural choice inside CockroachDB,
and the architecture of CockroachDB evolves in such a way that the
feature becomes non-sensical, it may be changed or removed in the next
major release.

For example, the structure and meaning of the output of the `EXPLAIN`
statement changes radically across major versions of CockroachDB due
to the evolution of its query optimizer.

### Product evolution

When Cockroach Labs decides to evolve
CockroachDB to better match demand by users, some existing public
interfaces may change.

In that case, existing clients will continue to work for minor
releases in the current major version and next, but may need to
evolve in version N+2.

For example, the features and particular data output of
`cockroach` sub-commands is likely to evolve in this way.

## CockroachDB external interfaces

The external interfaces of CockroachDB are:

- The [Web UI components](#web-ui-components): the in-browser cluster visualization and management panel.
- The [HTTP status endpoints](#http-status-endpoints): the direct URLs that provide access to CockroachDB internal status variables.
- The [Command line interface](#command-line-interface): the inputs and outputs of the `cockroach` sub-commands.
- The [Client protocol](#client-protocol) for SQL clients (pgwire): the byte structure of the flow of data between CockroachDB clients and nodes.
- The following SQL interfaces:
  - The [SQL syntax](#sql-syntax): which SQL query structure needs to be sent to CockroachDB to obtain a particular result.
  - The [SQL functional behavior](#sql-functional-behavior): which row sets / result counts are produced for a given input query.
  - The [SQL introspection interfaces](#sql-introspection-interfaces): the contents of `information_schema`, `pg_catalog` and `crdb_internal` tables.
  - The [SQL session variables](#sql-session-variables): the list and effects of session variables (`SHOW all` / `SET`).
  - The [SQL operational complexity](#sql-operational-complexity): max time and space complexity of individual SQL operators as a function of the input and operational parameters.
- The [Cluster Settings](#cluster-settings): the list and effects of [cluster-wide settings](cluster-settings.html).

Each of these interfaces have separate public/programmable,
public/non-programmable and reserved parts. These are detailed below.

### Web UI components

| Component                            | Status                      |
|--------------------------------------|-----------------------------|
| pages linked from the entry page     | public and non-programmable |
| pages not linked from the entry page | reserved                    |

### HTTP status endpoints

| Component  | Status                  |
|------------|-------------------------|
| health     | public and programmable |
| monitoring | public and programmable |
| debug      | reserved                |

### Command line interface

| Component                                                                                               | Status                                               |
|---------------------------------------------------------------------------------------------------------|------------------------------------------------------|
| Output of `--help` or `help`                                                                            | public and non-programmable                          |
| Output on `stderr`                                                                                      | public and non-programmable                          |
| Exit status                                                                                             | public and programmable                              |
| Logging output, prefix before log messages                                                              | public and programmable                              |
| Logging output, content of log messages after prefix                                                    | public and non-programmable                          |
| `cockroach certs`, input format                                                                         | public and programmable                              |
| `cockroach certs`, output on stdout/stderr                                                              | public and non-programmable                          |
| `cockroach certs`, output files                                                                         | public and programmable   (see note 2 below)         |
| `cockroach debug`, input/output                                                                         | reserved                                             |
| `cockroach init`, input/output                                                                          | public and programmable                              |
| `cockroach node`, input/output                                                                          | public and programmable (see note 2 below)           |
| `cockroach quit`, input/output                                                                          | public and programmable                              |
| `cockroach start`, input format                                                                         | public and programmable                              |
| `cockroach start`, status variables displayed when server ready                                         | public and programmable  (see note 2 below)          |
| `cockroach start`, informative and warning messages                                                     | public and non-programmable                          |
| `cockroach start`, location of data and log files                                                       | public and programmable                              |
| `cockroach start`, content of data files                                                                | public and non-programmable                          |
| `cockroach user`, input/output                                                                          | public and programmable  (see note 2 below)          |
| `cockroach version`, input/output                                                                       | public and programmable   (see note 2 below)         |
| `cockroach demo`, input/output                                                                          | public and non-programmable                          |
| `cockroach sql` input/output when ran interactively                                                     | public and non-programmable                          |
| `cockroach sql` non-interactive, SQL and `\cmd` inputs                                                  | public and programmable  (see note 2 below)          |
| `cockroach sql` non-interactive, SQL result output, format `raw`, `csv` or `tsv`                        | public and programmable   (see note 2 below)         |
| `cockroach sql` non-interactive, SQL result output, other display formats (`html`, `sql`, `table`, etc) | public and non-programmable                          |
| `cockroach sql` non-interactive, non-SQL output (eg. time measurements)                                 | public and non-programmable                          |
| `cockroach dump` input format                                                                           | public and programmable   (see note 2 below)         |
| `cockroach dump` output format                                                                          | reserved (see note 1 below)                          |
| `cockroach gen`, input format                                                                           | public and programmable   (see note 2 below)         |
| `cockroach gen`, output format                                                                          | public and non-programmable                          |
| `cockroach sqlfmt`, input format                                                                        | public and programmable   (see note 2 below)         |
| `cockroach sqlfmt`, output format                                                                       | public and non-programmable                          |
| `cockroach systembench`, input/output                                                                   | reserved                                             |
| `cockroach workload`, input format                                                                      | public and programmable (but currently experimental) |
| `cockroach workload`, output format                                                                     | public and non-programmable                          |

Note 1: the output format of `cockroach dump` may change between
versions, but the following guarantee is preserved: the database and
table contents that result from loading the output of `cockroach dump`
into another CockroachDB instance will be stable in the same way as
other public and programmable interfaces.

Note 2: new features may be added to the various `cockroach`
sub-commands across versions, including extending the existing output
formats with additional details / columns. Automated tooling that
reads and parses the output of `cockroach` command must be built to
ignore input they do not understand.

### Client protocol

| Component                                                       | Status                      |
|-----------------------------------------------------------------|-----------------------------|
| Client status parameters passed during connection set-up        | public and programmable     |
| Server status parameters passed during connection set-up        | public and programmable     |
| Text data encoding for values                                   | public and programmable     |
| Binary data encoding for values                                 | public and programmable     |
| Error code 40001 for retry errors                               | public and programmable     |
| Error codes for other errors, error message text for all errors | public and non-programmable |

### SQL syntax

Note: this section pertains to the grammar of SQL phrases input to
CockroachDB to yield a given logical plan. It does not pertain to the
results produced when executing a query—this is functional behavior,
as discussed in the next section.

| Component                                                                      | Status if feature documented on this site                                                                       | Status if not documented on this site |
|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Valid and supported both by CockroachDB and PostgreSQL                         | public and programmable                                                                                         | public and programmable               |
| Identifier (built-in function, variable, etc) contains the word `experimental` | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | reserved                              |
| Syntax contains the keyword EXPERIMENTAL                                       | public and programmable with [“experimental” status](#stability-phases-for-public-and-programmable-interfaces)  | reserved                              |
| Identifier (built-in function, schema, etc) contains the word `crdb_internal`  | reserved                                                                                                        | reserved                              |
| Valid and supported by CockroachDB but not PostgreSQL, excluding the above     | public and programmable                                                                                         | reserved                              |

### SQL functional behavior

#### Built-in functions

| Component                                                                                   | Status if feature documented on this site                                                                       | Status if not documented on this site |
|---------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Built-in function exists both in CockroachDB and PostgreSQL, and behaves like in PostgreSQL | public and programmable                                                                                         | public and programmable               |
| Built-in function exists both in CockroachDB and PostgreSQL, and behaves unlike PostgreSQL  | public and programmable                                                                                         | reserved                              |
| Name of built-in function exists in namespace `crdb_internal`                               | reserved                                                                                                        | reserved                              |
| Description of built-in function says function is “experimental”                            | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | reserved                              |
| Description of built-in function says function is “for internal use”                        | reserved                                                                                                        | reserved                              |
| Built-in function exists only in CockroachDB                                                | public and programmable                                                                                         | reserved                              |
| Other built-in functions, other than above                                                  | public and programmable                                                                                         | reserved                              |

#### Data manipulation language

Interface common to `SELECT`, `TABLE`, `VALUES`, `INSERT`, `UPDATE`, `DELETE`, `UPSERT`:

| Component                                                                                 | Status if feature documented on this site | Status if not documented on this site |
|-------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL                           | public and programmable                   | public and programmable               |
| SQL inputs, when query valid only in CockroachDB                                          | public and programmable                   | reserved                              |
| Output row set (regardless of order), when query valid both in CockroachDB and PostgreSQL | public and programmable                   | public and programmable               |
| Output row set (regardless of order), when query valid only in CockroachDB                | public and programmable                   | reserved                              |
| Output row order, when query valid both in CockroachDB and PostgreSQL                     | public and programmable                   | public and non-programmable           |
| Output row count, when query valid both in CockroachDB and PostgreSQL                     | public and programmable                   | public and non-programmable           |
| Output row order, when query valid only in CockroachDB                                    | public and programmable                   | reserved                              |
| Output row count, when query valid only in CockroachDB                                    | public and programmable                   | reserved                              |

#### Data definition language

Interface common to DDL statements: `CREATE`, `DROP`, `ALTER`, `TRUNCATE` on database objects (databases, tables, views, sequences, etc.):

| Component                                                                                                                                | Status if feature documented on this site | Status if not documented on this site |
|------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL                                                                          | public and programmable                   | public and programmable               |
| SQL inputs, when query valid only in CockroachDB                                                                                         | public and programmable                   | reserved                              |
| Effect and isolation when ran as a standalone statement outside of BEGIN/COMMIT, when statement valid both in CockroachDB and PostgreSQL | public and programmable                   | public and programmable               |
| Effect and isolation when ran as a standalone statement outside of BEGIN/COMMIT, when statement valid only in CockroachDB                | public and programmable                   | public and non-programmable           |
| Effect and isolation when ran inside BEGIN/COMMIT                                                                                        | public and programmable                   | public and non-programmable           |
| Output row count                                                                                                                         | reserved                                  | reserved                              |

#### Privilege management

Interface common to `CREATE`/`DROP` for  `USER` or `ROLE`, `GRANT`, `REVOKE`:

| Component                                                       | Status if feature documented on this site | Status if not documented on this site |
|-----------------------------------------------------------------|-------------------------------------------|---------------------------------------|
| SQL inputs, when query valid both in CockroachDB and PostgreSQL | public and programmable                   | public and programmable               |
| SQL inputs, when query valid only in CockroachDB                | public and programmable                   | reserved                              |
| Effect and isolation                                            | public and programmable                   | public and non-programmable           |
| Output row count                                                | public and programmable                   | reserved                              |

#### Bulk I/O statements

| Component                                    | Status if feature documented on this site | Status if not documented on this site |
|----------------------------------------------|-------------------------------------------|---------------------------------------|
| `BACKUP`/`EXPORT` SQL parameters and output  | public and programmable                   | reserved                              |
| `BACKUP` result data files                   | reserved (see note 1 below)               | reserved (see note 1 below)           |
| `EXPORT` result data files                   | public and programmable                   | reserved                              |
| `RESTORE`/`IMPORT` SQL parameters and output | public and programmable                   | reserved                              |
| `RESTORE` input data files                   | reserved (see note 1 below)               | reserved (see note 1 below)           |
| `IMPORT` input data files                    | public and programmable                   | reserved                              |

Note 1: the output format of `BACKUP` may change between versions, but
the following guarantee is preserved: the database and table contents
that result from `RESTORE`ing a backup into another CockroachDB instance
will be stable in the same way as other public and programmable
interfaces.

#### Other SQL statements or constructs

| Component                                                                      | Status if feature documented on this site       | Status if not documented on this site |
|--------------------------------------------------------------------------------|-------------------------------------------------|---------------------------------------|
| `EXPLAIN` inputs and outputs                                                   | public and non-programmable                     | reserved                              |
| `CANCEL`, `PAUSE`, `RESUME` inputs                                             | public and programmable                         | reserved                              |
| `CANCEL`, `PAUSE`, `RESUME` success/error status                               | public and programmable                         | reserved                              |
| `CANCEL`, `PAUSE`, `RESUME` outputs                                            | public and non-programmable                     | reserved                              |
| `SCRUB` inputs and outputs                                                     | public and programmable in “experimental” phase | reserved                              |
| Tabular data produced by set-generating functions also supported in PostgreSQL | public and programmable                         | public and programmable               |
| Tabular data produced by set-generating functions specific to CockroachDB      | public and programmable                         | reserved                              |

### SQL introspection interfaces

| Component                                                                                                | Status if feature documented on this site                                                                       | Status if not documented on this site |
|----------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Table and column schema of `information_schema`, when also present in PostgreSQL                         | public and programmable                                                                                         | public and programmable               |
| Table and column schema of `information_schema`, when CockroachDB-specific                               | public and programmable                                                                                         | reserved                              |
| Table and column schema of `pg_catalog`, when same as PostgreSQL                                         | public and programmable                                                                                         | public and programmable               |
| Table and column schema of `pg_catalog`, when incomplete/missing compared to PostgreSQL                  | public and programmable                                                                                         | reserved                              |
| Cell contents of `pg_catalog` and `information_schema`, when populated similarly as PostgreSQL           | public and programmable                                                                                         | public and programmable               |
| Cell contents of `pg_catalog` and `information_schema`, when absent or incomplete compared to PostgreSQL | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | reserved                              |
| `SHOW` inputs                                                                                            | public and programmable                                                                                         | reserved                              |
| `SHOW` outputs                                                                                           | public and non-programmable                                                                                     | reserved                              |
| Table and column schema of `crdb_internal`                                                               | reserved                                                                                                        | reserved                              |
| Contents of `crdb_internal`                                                                              | reserved                                                                                                        | reserved                              |

### SQL session variables

| Component                                                                          | Status if feature documented on this site                                                                       | Status if not documented on this site |
|------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Effect and configurability of variable whose name contains the word `experimental` | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | reserved                              |
| Effect and configurability of variable, when identical to PostgreSQL               | public and programmable                                                                                         | public and programmable               |
| Effect and configurability of variable, when incomplete compared to PostgreSQL     | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | public and non-programmable           |
| Effect and configurability of variable, when CockroachDB-specific                  | public and programmable                                                                                         | reserved                              |

### SQL operational complexity

The following table uses [big-O
notation](https://en.wikipedia.org/wiki/Big_O_notation) to indicate
the expected performance class of various SQL relational
operators. The variables are:

- **n**  number of rows processed,
- **r** number of data ranges accessed,
- **p** number of logical processors performing the computation during execution,
- **g**  number of aggregation groups,
- **m** for the max data size of rows,
- **N** for n x m,
- **k** for the max data size of key, aggregation or sort columns,
- **K** for n x k,

| Operation                                             | Time complexity | Space complexity | Status                      |
|-------------------------------------------------------|-----------------|------------------|-----------------------------|
| point lookups in tables or indexes                    | O(1)            | O(m x p=r)       | public and non-programmable |
| range scans in tables or indexes                      | O(K/p=r)        | O(m x p=r)       | public and non-programmable |
| ordered inner joins                                   | O(K/p)          | O(N)             | public and non-programmable |
| outer joins                                           | O(K/p+K)        | O(Np)            | public and non-programmable |
| sorts                                                 | O(K/p log K/p)  | O(N)             | public and non-programmable |
| non-expanding aggregations (see note 1 below)         | O(K/p)          | O(kg)            | public and non-programmable |
| expanding aggregations (see note 1 below)             | O(K/p)          | O(K)             | public and non-programmable |
| accesss to virtual tables or set-generating functions | O(N)            | O(1)             | public and non-programmable |
| sequence access or increment                          | O(1)            | O(1)             | public and non-programmable |
| window function application                           | O(N^2)          | O(N)             | public and non-programmable |

Note 1: aggregations operators like `array_agg` produce results whose
size is proportional to the sum of the size of the inputs. This can
cause large memory usage during an aggregation if applied to a large
number of inputs.

## Cluster settings

| Component                                                                                                                                             | Status if feature documented on this site                                                                       | Status if not documented on this site |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------|---------------------------------------|
| Effect and configurability of settings whose name contains the word `experimental`                                                                    | public and programmable with  [“experimental” status](#stability-phases-for-public-and-programmable-interfaces) | reserved                              |
| Effect and configurability of hidden settings (now listed in `SHOW ALL CLUSTER SETTINGS`)                                                             | reserved                                                                                                        | reserved                              |
| Effect and configurability of settings pertaining to low-level CockroachDB internals, e.g., whose name starts with `kv.`, `server.`, `rocksdb.`, etc. | public and non-programmable                                                                                     | reserved                              |
| Effect and configurability of other settings                                                                                                          | public and programmable                                                                                         | reserved                              |
