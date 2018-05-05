
| Property                            | UUID generated with `uuid_v4()`         | INT generated with `unique_rowid()`           | Sequences                      |
|-------------------------------------|-----------------------------------------|-----------------------------------------------|--------------------------------|
| Size                                | 16 bytes                                | 8 bytes                                       | 1 to 8 bytes                   |
| Ordering properties                 | Unordered                               | Somewhat time-ordered                         | Highly time-ordered            |
| Performance cost at generation      | Small, scalable                         | Small, scalable                               | Variable, can cause contention |
| Value distribution                  | Uniformly distributed (128 bits)        | Contains time and space (node ID) components  | Dense, small values            |
| Data locality                       | Maximally distributed                   | Values generated close in time are co-located | Highly local                   |
| INSERT performance when used as key | Highest                                 | Lower for values generated close in time      | Slowest                        |
| Read performance when used as key   | Highest (maximal parallelism)           | Parallelism possible for values far in time   | Poor                           |

