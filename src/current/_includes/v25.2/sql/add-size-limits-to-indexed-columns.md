We **strongly recommend** adding size limits to all [indexed columns]({% link {{ page.version.version }}/indexes.md %}), which includes columns in [primary keys]({% link {{ page.version.version }}/primary-key.md %}).

Values exceeding 1 MiB can lead to [storage layer write amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#write-amplification) and cause significant performance degradation or even [crashes due to OOMs (out of memory errors)]({% link {{ page.version.version }}/cluster-setup-troubleshooting.md %}#out-of-memory-oom-crash).

To add a size limit using [`CREATE TABLE`]({% link {{ page.version.version }}/create-table.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE name (first STRING(100), last STRING(100));
~~~

To add a size limit using [`ALTER TABLE ... ALTER COLUMN`]({% link {{ page.version.version }}/alter-table.md %}#alter-column):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE name ALTER first TYPE STRING(99);
~~~
