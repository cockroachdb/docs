[`REGIONAL BY TABLE`](multiregion-overview.html#regional-tables) and [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables) tables can be restored **only** if the regions of the backed-up table match those of the target database. All of the following must be true for `RESTORE` to be successful:

    * The [regions](multiregion-overview.html#database-regions) of the source database and the regions of the destination database have the same set of regions.
    * The regions were added to each of the databases in the same order.
    * The databases have the same [primary region](set-primary-region.html).

    The following example would be considered as having **mismatched** regions because the database regions were not added in the same order and the primary regions do not match.

    Running on the source database:

    ~~~ sql
    ALTER DATABASE source_database SET PRIMARY REGION "us-east1";
    ~~~
    ~~~ sql
    ALTER DATABASE source_database ADD region "us-west1";  
    ~~~

    Running on the destination database:

    ~~~ sql
    ALTER DATABASE destination_database SET PRIMARY REGION "us-west1";
    ~~~
    ~~~ sql
    ALTER DATABASE destination_database ADD region "us-east1";  
    ~~~

    In addition, the following scenario has mismatched regions between the databases since the regions were not added to the database in the same order.

    Running on the source database:

    ~~~ sql
    ALTER DATABASE source_database SET PRIMARY REGION "us-east1";
    ~~~
    ~~~ sql
    ALTER DATABASE source_database ADD region "us-west1";  
    ~~~

    Running on the destination database:

    ~~~ sql
    ALTER DATABASE destination_database SET PRIMARY REGION "us-west1";
    ~~~
    ~~~ sql
    ALTER DATABASE destination_database ADD region "us-east1";
    ~~~
    ~~~ sql  
    ALTER DATABASE destination_database SET PRIMARY REGION "us-east1";    
    ~~~
