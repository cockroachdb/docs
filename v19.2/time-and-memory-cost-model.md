---
title: Time and memory cost model
summary: Recommended time and space costing functions for common operations inside CockroachDB.
toc: false
---

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
| point lookups in tables or indexes                    | O(1)            | O(m x p=r)       | [public and non-programmable] |
| range scans in tables or indexes                      | O(K/p=r)        | O(m x p=r)       | [public and non-programmable] |
| ordered inner joins                                   | O(K/p)          | O(N)             | [public and non-programmable] |
| outer joins                                           | O(K/p+K)        | O(Np)            | [public and non-programmable] |
| sorts                                                 | O(K/p log K/p)  | O(N)             | [public and non-programmable] |
| non-expanding aggregations (see note 1 below)         | O(K/p)          | O(kg)            | [public and non-programmable] |
| expanding aggregations (see note 1 below)             | O(K/p)          | O(K)             | [public and non-programmable] |
| accesss to virtual tables or set-generating functions | O(N)            | O(1)             | [public and non-programmable] |
| sequence access or increment                          | O(1)            | O(1)             | [public and non-programmable] |
| window function application                           | O(N^2)          | O(N)             | [public and non-programmable] |

Note 1: aggregations operators like `array_agg` produce results whose
size is proportional to the sum of the size of the inputs. This can
cause large memory usage during an aggregation if applied to a large
number of inputs.

## See also

- [Interface types](interface-types.html)
- [Compatibility and programmability guarantees](compatibility-and-programmability-guarantees.html)
- [Overview of APIs and interfaces](overview-of-apis-and-interfaces.html)

[public and programmable]: interface-types.html#public-and-programmable-interfaces
[public and non-programmable]: interface-types.html#public-and-non-programmable-interfaces
[reserved]: interface-types.html#reserved-interfaces
