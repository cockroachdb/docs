
| Property                             | UUID generated with `uuid_v4()`         | INT generated with `unique_rowid()`           | Sequences                      |
|--------------------------------------|-----------------------------------------|-----------------------------------------------|--------------------------------|
| Size                                 | 16 bytes                                | 8 bytes                                       | 1 to 8 bytes                   |
| Ordering properties                  | Unordered                               | Highly time-ordered                           | Highly time-ordered            |
| Performance cost at generation       | Small, scalable                         | Small, scalable                               | Variable, can cause contention |
| Value distribution                   | Uniformly distributed (128 bits)        | Contains time and space (node ID) components  | Dense, small values            |
| Data locality                        | Maximally distributed                   | Values generated close in time are co-located | Highly local                   |
| `INSERT` latency when used as key    | Small, insensitive to concurrency       | Small, but increases with concurrent INSERTs  | Higher                         |
| `INSERT` throughput when used as key | Highest                                 | Limited by max throughput on 1 node           | Limited by max throughput on 1 node |
| Read throughput when used as key     | Highest (maximal parallelism)           | Limited                                       | Limited                        |
