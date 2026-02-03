As the CockroachDB `root` user, open the [built-in SQL shell](cockroach-sql.html) in insecure or secure mode, as per your CockroachDB setup. In the following example, we assume that CockroachDB is running in insecure mode. Then use the [`SET CLUSTER SETTING`](set-cluster-setting.html) command to set the name of your organization and the license key:

~~~ shell
$ cockroach sql --insecure
~~~

~~~ sql
>  SET CLUSTER SETTING cluster.organization = 'Acme Company';
~~~

~~~ sql
>  SET CLUSTER SETTING enterprise.license = 'xxxxxxxxxxxx';
~~~
