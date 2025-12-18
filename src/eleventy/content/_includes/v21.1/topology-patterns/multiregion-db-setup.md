First, create a database and set it as the default database:

~~~ sql
CREATE DATABASE test;
~~~

~~~ sql
USE test;
~~~

[This cluster is already deployed across three regions](#cluster-setup).  Therefore, to make this database a "multi-region database", you need to issue the following SQL statement that [sets the primary region](add-region.html#set-the-primary-region):

~~~ sql
ALTER DATABASE test PRIMARY REGION "us-east";
~~~

{{site.data.alerts.callout_info}}
Every multi-region database must have a primary region.  For more information, see [Database regions](multiregion-overview.html#database-regions).
{{site.data.alerts.end}}

Next, issue the following [`ADD REGION`](add-region.html) statements to add the remaining regions to the database.

~~~ sql
ALTER DATABASE test ADD REGION "us-west";
~~~

~~~ sql
ALTER DATABASE test ADD REGION "us-central";
~~~

Congratulations, `test` is now a multi-region database!
