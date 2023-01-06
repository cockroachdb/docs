We **strongly recommend** adding size limits to all [indexed columns](indexes.html), which includes columns in [primary keys](primary-key.html).

Values exceeding 1 MiB can lead to [storage layer write amplification](architecture/storage-layer.html#write-amplification) and cause significant performance degradation or even [crashes due to OOMs (out of memory errors)](cluster-setup-troubleshooting.html#out-of-memory-oom-crash).

To add a size limit using [`CREATE TABLE`](create-table.html):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE name (first STRING(100), last STRING(100));
~~~

To add a size limit using [`ALTER TABLE ... ALTER COLUMN`](alter-column.html):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE name ALTER first TYPE STRING(99);
~~~
