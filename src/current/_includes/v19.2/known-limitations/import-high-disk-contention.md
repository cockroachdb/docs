[`IMPORT`](import.html) can sometimes fail with a "context canceled" error, or can restart itself many times without ever finishing. If this is happening, it is likely due to a high amount of disk contention. This can be mitigated by setting the `kv.bulk_io_write.max_rate` [cluster setting](cluster-settings.html) to a value below your max disk write speed. For example, to set it to 10MB/s, execute:

{% include copy-clipboard.html %}
~~~ sql
> SET CLUSTER SETTING kv.bulk_io_write.max_rate = '10MB';
~~~
