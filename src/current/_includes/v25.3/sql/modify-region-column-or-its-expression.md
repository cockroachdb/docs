The following instructions show how to change the mapping of the [`crdb_internal_region`]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) column that determines row locality for a [`REGIONAL BY ROW AS <column>` table]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) by [altering the computed column's expression]({% link {{ page.version.version }}/computed-columns.md %}#alter-the-formula-for-a-computed-column).

1. Add a new region column of the same type (`crdb_internal_region`) with the updated expression:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users ADD COLUMN region_new crdb_internal_region AS ({new_expression}) STORED;
    ~~~

2. Atomically swap the column names in a transaction so the original column is preserved and the new column takes the `region` name. Note that after the first rename, the table continues to be `REGIONAL BY ROW AS region_old` because the locality metadata follows the column formerly named `region`.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    BEGIN;
    ALTER TABLE app.public.users RENAME COLUMN region TO region_old;
    ALTER TABLE app.public.users RENAME COLUMN region_new TO region;
    COMMIT;
    ~~~

3. Point the table locality at the new column using [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#set-locality) to the new column. Be sure to do this outside the transaction that performed the column renames:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users SET LOCALITY REGIONAL BY ROW AS region;
    ~~~

4. After verifying the changes have occurred, drop the old column:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users DROP COLUMN region_old;
    ~~~
