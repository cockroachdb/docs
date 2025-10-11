1. Create a database and set it as the default database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    CREATE DATABASE test;
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    USE test;
    ~~~

    [This cluster is already deployed across three regions](#cluster-setup). Therefore, to make this database a "multi-region database", issue the following SQL statement to [set the primary region](alter-database.html#set-the-primary-region):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER DATABASE test PRIMARY REGION "us-east";
    ~~~

    {{site.data.alerts.callout_info}}
    Every multi-region database must have a primary region.  For more information, see [Database regions](multiregion-overview.html#database-regions).
    {{site.data.alerts.end}}

1. Issue the following [`ADD REGION`](alter-database.html#add-region) statements to add the remaining regions to the database:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER DATABASE test ADD REGION "us-west";
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER DATABASE test ADD REGION "us-central";
    ~~~
