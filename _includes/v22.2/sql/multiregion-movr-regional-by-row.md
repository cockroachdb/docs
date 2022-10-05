All of the tables except `promo_codes` contain rows which are partitioned by region, and updated very frequently. For these tables, the right table locality for optimizing access to their data is [`REGIONAL BY ROW`](multiregion-overview.html#regional-by-row-tables).

Apply this table locality to the remaining tables. These statements use a `CASE` statement to put data for a given city in the right region and can take around 1 minute to complete for each table.

- `rides`

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE rides ADD COLUMN region crdb_internal_region AS (
      CASE WHEN city = 'amsterdam' THEN 'europe-west1'
           WHEN city = 'paris' THEN 'europe-west1'
           WHEN city = 'rome' THEN 'europe-west1'
           WHEN city = 'new york' THEN 'us-east1'
           WHEN city = 'boston' THEN 'us-east1'
           WHEN city = 'washington dc' THEN 'us-east1'
           WHEN city = 'san francisco' THEN 'us-west1'
           WHEN city = 'seattle' THEN 'us-west1'
           WHEN city = 'los angeles' THEN 'us-west1'
      END
    ) STORED;
    ALTER TABLE rides ALTER COLUMN REGION SET NOT NULL;
    ALTER TABLE rides SET LOCALITY REGIONAL BY ROW AS "region";
    ~~~

- `user_promo_codes`

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE user_promo_codes ADD COLUMN region crdb_internal_region AS (
      CASE WHEN city = 'amsterdam' THEN 'europe-west1'
           WHEN city = 'paris' THEN 'europe-west1'
           WHEN city = 'rome' THEN 'europe-west1'
           WHEN city = 'new york' THEN 'us-east1'
           WHEN city = 'boston' THEN 'us-east1'
           WHEN city = 'washington dc' THEN 'us-east1'
           WHEN city = 'san francisco' THEN 'us-west1'
           WHEN city = 'seattle' THEN 'us-west1'
           WHEN city = 'los angeles' THEN 'us-west1'
      END
    ) STORED;
    ALTER TABLE user_promo_codes ALTER COLUMN REGION SET NOT NULL;
    ALTER TABLE user_promo_codes SET LOCALITY REGIONAL BY ROW AS "region";
    ~~~

- `users`

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE users ADD COLUMN region crdb_internal_region AS (
      CASE WHEN city = 'amsterdam' THEN 'europe-west1'
           WHEN city = 'paris' THEN 'europe-west1'
           WHEN city = 'rome' THEN 'europe-west1'
           WHEN city = 'new york' THEN 'us-east1'
           WHEN city = 'boston' THEN 'us-east1'
           WHEN city = 'washington dc' THEN 'us-east1'
           WHEN city = 'san francisco' THEN 'us-west1'
           WHEN city = 'seattle' THEN 'us-west1'
           WHEN city = 'los angeles' THEN 'us-west1'
      END
    ) STORED;
    ALTER TABLE users ALTER COLUMN REGION SET NOT NULL;
    ALTER TABLE users SET LOCALITY REGIONAL BY ROW AS "region";
    ~~~

- `vehicle_location_histories`

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE vehicle_location_histories ADD COLUMN region crdb_internal_region AS (
      CASE WHEN city = 'amsterdam' THEN 'europe-west1'
           WHEN city = 'paris' THEN 'europe-west1'
           WHEN city = 'rome' THEN 'europe-west1'
           WHEN city = 'new york' THEN 'us-east1'
           WHEN city = 'boston' THEN 'us-east1'
           WHEN city = 'washington dc' THEN 'us-east1'
           WHEN city = 'san francisco' THEN 'us-west1'
           WHEN city = 'seattle' THEN 'us-west1'
           WHEN city = 'los angeles' THEN 'us-west1'
      END
    ) STORED;
    ALTER TABLE vehicle_location_histories ALTER COLUMN REGION SET NOT NULL;
    ALTER TABLE vehicle_location_histories SET LOCALITY REGIONAL BY ROW AS "region";
    ~~~

- `vehicles`

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    ALTER TABLE vehicles ADD COLUMN region crdb_internal_region AS (
      CASE WHEN city = 'amsterdam' THEN 'europe-west1'
           WHEN city = 'paris' THEN 'europe-west1'
           WHEN city = 'rome' THEN 'europe-west1'
           WHEN city = 'new york' THEN 'us-east1'
           WHEN city = 'boston' THEN 'us-east1'
           WHEN city = 'washington dc' THEN 'us-east1'
           WHEN city = 'san francisco' THEN 'us-west1'
           WHEN city = 'seattle' THEN 'us-west1'
           WHEN city = 'los angeles' THEN 'us-west1'
      END
    ) STORED;
    ALTER TABLE vehicles ALTER COLUMN REGION SET NOT NULL;
    ALTER TABLE vehicles SET LOCALITY REGIONAL BY ROW AS "region";
    ~~~
