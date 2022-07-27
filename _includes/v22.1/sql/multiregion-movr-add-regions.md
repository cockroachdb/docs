Execute the following statements. They will tell CockroachDB about the database's regions. This information is necessary so that CockroachDB can later move data around to optimize access to particular data from particular regions. For more information about how this works at a high level, see [Database Regions](multiregion-overview.html#database-regions).

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER DATABASE movr PRIMARY REGION "us-east1";
ALTER DATABASE movr ADD REGION "europe-west1";
ALTER DATABASE movr ADD REGION "us-west1";
~~~
