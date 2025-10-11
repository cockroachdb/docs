When upgrading from v20.1.x to v20.2.0, as soon as any node of the cluster has run v20.2.0, it is important to avoid dropping, renaming, or truncating tables, views, sequences, or databases on the v20.1 nodes. This is true even in cases where nodes were upgraded to v20.2.0 and then rolled back to v20.1.

In this case, avoid running the following operations against v20.1 nodes:

- [`DROP TABLE`]({% link {{ page.version.version }}/drop-table.md %}), [`TRUNCATE TABLE`]({% link {{ page.version.version }}/truncate.md %}), [`RENAME TABLE`]({% link {{ page.version.version }}/alter-table.md %}#rename-to)
- [`DROP VIEW`]({% link {{ page.version.version }}/drop-view.md %})
- [`DROP SEQUENCE`]({% link {{ page.version.version }}/drop-sequence.md %}), [`RENAME SEQUENCE`]({% link {{ page.version.version }}/rename-sequence.md %})
- [`DROP DATABASE`]({% link {{ page.version.version }}/drop-database.md %}), [`ALTER DATABASE ... RENAME TO`]({% link {{ page.version.version }}/alter-database.md %}#rename-to)

Running any of these operations against v19.2 nodes will result in inconsistency between two internal tables, `system.namespace` and `system.namespace2`. This inconsistency will prevent you from being able to recreate the dropped or renamed objects; the returned error will be `ERROR: relation <name of dropped/renamed object> already exists`. In the case of a dropped or renamed database, [`SHOW DATABASES`]({% link {{ page.version.version }}/show-databases.md %}) will also return an error: `ERROR: internal error: "" is not a database`.
