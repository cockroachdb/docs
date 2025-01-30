We **strongly recommend** adding size limits to all [indexed columns]({{ page.version.version }}/indexes.md), which includes columns in [primary keys]({{ page.version.version }}/primary-key.md).

Values exceeding 1 MiB can lead to [storage layer write amplification]({{ page.version.version }}/architecture/storage-layer.md#write-amplification) and cause significant performance degradation or even [crashes due to OOMs (out of memory errors)]({{ page.version.version }}/cluster-setup-troubleshooting.md#out-of-memory-oom-crash).

To add a size limit using [`CREATE TABLE`]({{ page.version.version }}/create-table.md):

{% include "_includes/copy-clipboard.html" %}
~~~ sql
CREATE TABLE name (first STRING(100), last STRING(100));
~~~

To add a size limit using [`ALTER TABLE ... ALTER COLUMN`]({{ page.version.version }}/alter-table.md#alter-column):

{% include "_includes/copy-clipboard.html" %}
~~~ sql
SET enable_experimental_alter_column_type_general = true;
~~~

{% include "_includes/copy-clipboard.html" %}
~~~ sql
ALTER TABLE name ALTER first TYPE STRING(99);
~~~
