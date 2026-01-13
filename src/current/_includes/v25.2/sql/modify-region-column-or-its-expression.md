The following instructions show how to change the mapping of the [`crdb_internal_region`]({% link {{ page.version.version }}/alter-table.md %}#crdb_region) column that determines row locality for a [regional by row table]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) where the [column was already defined with `REGIONAL BY ROW AS {column}`]{% if page.name == "create-table.md" %}(#create-a-table-with-a-regional-by-row-locality-using-a-custom-region-column){% elsif page.name == "alter-table.md" %}(#rename-crdb_region){% else %}({% link {{ page.version.version }}/create-table.md %}#create-a-table-with-a-regional-by-row-locality-using-a-custom-region-column){% endif %}. This method [alters the computed column's expression]({% link {{ page.version.version }}/computed-columns.md %}#alter-the-formula-for-a-computed-column).

1. [Add a new region column]({% link {{ page.version.version }}/alter-table.md %}#add-column) of the same type (`crdb_internal_region`) with the updated scalar expression for the computed column:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users ADD COLUMN region_new crdb_internal_region AS ({new_expression}) STORED;
    ~~~

1. Atomically [swap the column names]({% link {{ page.version.version }}/alter-table.md %}#rename-column) so the new computed column takes the original name:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users RENAME COLUMN region TO region_prev, RENAME COLUMN region_new TO region;
    ~~~

1. Point the table locality at the new computed column using [`ALTER TABLE ... SET LOCALITY`]({% link {{ page.version.version }}/alter-table.md %}#set-locality):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users SET LOCALITY REGIONAL BY ROW AS region;
    ~~~

1. After verifying the changes have occurred (using a query like `SELECT region, * FROM app.public.users WHERE ...`), [drop the previous computed column]({% link {{ page.version.version }}/alter-table.md %}#drop-column):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE app.public.users DROP COLUMN region_prev;
    ~~~
