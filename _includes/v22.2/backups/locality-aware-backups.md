To view a list of [locality-aware backups](take-and-restore-locality-aware-backups.html), pass the endpoint [collection URI](backup.html#backup-file-urls) that is set as the `default` location with `COCKROACH_LOCALITY=default`: 

{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW BACKUPS IN 's3://{default collection URI}/{path}?AWS_ACCESS_KEY_ID={placeholder}&AWS_SECRET_ACCESS_KEY={placeholder}';
~~~

~~~
        path
-------------------------
/2023/02/23-150925.62
/2023/03/08-192859.44
(2 rows)
~~~