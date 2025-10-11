When upgrading from v19.2.x to v20.1.0, as soon as any node of the cluster has run v20.1.0, it is important to avoid dropping, renaming, or truncating tables, views, sequences, or databases on the v19.2 nodes. This is true even in cases where nodes were upgraded to v20.1.0 and then rolled back to v19.2.

In this case, avoid running the following operations against v19.2 nodes:

- [`DROP TABLE`](drop-table.html), [`TRUNCATE TABLE`](truncate.html), [`RENAME TABLE`](rename-table.html)
- [`DROP VIEW`](drop-view.html)
- [`DROP SEQUENCE`](drop-sequence.html), [`RENAME SEQUENCE`](rename-sequence.html)
- [`DROP DATABASE`](drop-database.html), [`RENAME DATABASE`](rename-database.html)

Running any of these operations against v19.2 nodes will result in inconsistency between two internal tables, `system.namespace` and `system.namespace2`. This inconsistency will prevent you from being able to recreate the dropped or renamed objects; the returned error will be `ERROR: relation <name of dropped/renamed object> already exists`. In the case of a dropped or renamed database, [`SHOW DATABASES`](show-databases.html) will also return an error: `ERROR: internal error: "" is not a database`.
