| Parameter name | Description | Data type | Default value
|---------------------+----------------------|-----|------|
| `bucket_count` | The number of buckets into which a [hash-sharded index](hash-sharded-indexes.html) will split. | Integer | The value of the `sql.defaults.default_hash_sharded_index_bucket_count` [cluster setting](cluster-settings.html). |
| `geometry_max_x` | The maximum X-value of the [spatial reference system](spatial-glossary.html#spatial-reference-system) for the object(s) being covered. This only needs to be set if you are using a custom [SRID](spatial-glossary.html#srid). | | Derived from SRID bounds, else `(1 << 31) -1`. |
| `geometry_max_y` | The maximum Y-value of the [spatial reference system](spatial-glossary.html#spatial-reference-system) for the object(s) being covered. This only needs to be set if you are using a custom [SRID](spatial-glossary.html#srid). | | Derived from SRID bounds, else `(1 << 31) -1`. |
| `geometry_min_x` | The minimum X-value of the [spatial reference system](spatial-glossary.html#spatial-reference-system) for the object(s) being covered. This only needs to be set if the default bounds of the SRID are too large/small for the given data, or SRID = 0 and you wish to use a smaller range (unfortunately this is currently not exposed, but is viewable on <https://epsg.io/3857>). By default, SRID = 0 assumes `[-min int32, max int32]` ranges. | | Derived from SRID bounds, else `-(1 << 31)`. |
| `geometry_min_y` | The minimum Y-value of the [spatial reference system](spatial-glossary.html#spatial-reference-system) for the object(s) being covered. This only needs to be set if you are using a custom [SRID](spatial-glossary.html#srid). | | Derived from SRID bounds, else `-(1 << 31)`. |
| `s2_level_mod` | `s2_max_level` must be divisible by `s2_level_mod`. `s2_level_mod` must be between `1` and `3`. | Integer | `1` |
| `s2_max_cells` | The maximum number of S2 cells used in the covering. Provides a limit on how much work is done exploring the possible coverings. Allowed values: `1-30`. You may want to use higher values for odd-shaped regions such as skinny rectangles. Used in [spatial indexes](spatial-indexes.html). | Integer | `4` |
| `s2_max_level` | The maximum level of S2 cell used in the covering. Allowed values: `1-30`. Setting it to less than the default means that CockroachDB will be forced to generate coverings using larger cells. Used in [spatial indexes](spatial-indexes.html). | Integer | `30` |

The following parameters are included for PostgreSQL compatibility and do not affect how CockroachDB runs:

- `fillfactor`
