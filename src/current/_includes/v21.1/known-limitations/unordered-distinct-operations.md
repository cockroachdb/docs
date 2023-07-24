Disk spilling [isn't supported](https://github.com/cockroachdb/cockroach/issues/61411) when running `UPSERT` statements that have `nulls are distinct` and `error on duplicate` markers. You can check this by using `EXPLAIN` and looking at the statement plan.

~~~
        ├── distinct                     |                     |
        │    │                           | distinct on         | ...
        │    │                           | nulls are distinct  |
        │    │                           | error on duplicate  |
~~~
