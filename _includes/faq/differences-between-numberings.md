| Property                       | UUID generated with `uuid_v4()`         | INT generated with `unique_rowid()`          | Sequences                      |
|--------------------------------|-----------------------------------------|----------------------------------------------|--------------------------------|
| Size                           | 16 bytes                                | 8 bytes                                      | 1 to 8 bytes                   |
| Ordering properties            | Unordered                               | Somewhat time-ordered                        | Highly time-ordered            |
| Value distribution             | Uniformly distributed (128 bits)        | Contains time and space (node ID) components | Dense, small values            |
| Performance cost at generation | Small, scalable                         | Small, scalable                              | Variable, can cause contention |
| Locality                       | Maximally distributed, least contention | Somewhat local, may cause INSERT contention  | Highly local, most INSERT contention |
