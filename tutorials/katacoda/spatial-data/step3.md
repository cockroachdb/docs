1. Create a `tutorial` database, and use it.

    ```sql
    CREATE DATABASE tutorial;
    USE tutorial;
    ```{{execute}}

2. `IMPORT` the parts of the data set that live in the `tutorial` database.

    ```sql
    IMPORT PGDUMP ('https://spatial-tutorial.s3.us-east-2.amazonaws.com/bookstores-and-roads-20210125.sql');
    ```{{execute}}

    ```
            job_id       |  status   | fraction_completed |  rows  | index_entries |  bytes
    ---------------------+-----------+--------------------+--------+---------------+-----------
      629565276454256641 | succeeded |                  1 | 228807 |             0 | 75952972
    (1 row)

    Time: 17.745s total (execution 17.744s / network 0.000s)
    ```

3. Create a `birds` database, and use it.

    ```sql
    CREATE DATABASE birds;
    USE birds;
    ```{{execute}}

4. `IMPORT` the parts of the data set that live in the `birds` database.

    ```sql
    IMPORT PGDUMP ('https://spatial-tutorial.s3.us-east-2.amazonaws.com/birds-20210125.sql');
    ```{{execute}}

    ```
            job_id       |  status   | fraction_completed | rows  | index_entries |  bytes
    ---------------------+-----------+--------------------+-------+---------------+----------
      629565605599412225 | succeeded |                  1 | 86616 |             0 | 4096847
    (1 row)
    ```

5. Switch back to the `tutorial` database. All of the queries in this tutorial assume you are in the `tutorial` database.

    ```sql
    USE tutorial;
    ```{{execute}}
