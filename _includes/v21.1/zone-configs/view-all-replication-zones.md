{% include_cached copy-clipboard.html %}
~~~ sql
> SHOW ALL ZONE CONFIGURATIONS;
~~~

~~~
                                              target                                             |                                                      raw_config_sql
-------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------
  RANGE default                                                                                  | ALTER RANGE default CONFIGURE ZONE USING
                                                                                                 |     range_min_bytes = 134217728,
                                                                                                 |     range_max_bytes = 536870912,
                                                                                                 |     gc.ttlseconds = 90000,
                                                                                                 |     num_replicas = 3,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  DATABASE system                                                                                | ALTER DATABASE system CONFIGURE ZONE USING
                                                                                                 |     range_min_bytes = 134217728,
                                                                                                 |     range_max_bytes = 536870912,
                                                                                                 |     gc.ttlseconds = 90000,
                                                                                                 |     num_replicas = 5,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  RANGE meta                                                                                     | ALTER RANGE meta CONFIGURE ZONE USING
                                                                                                 |     range_min_bytes = 134217728,
                                                                                                 |     range_max_bytes = 536870912,
                                                                                                 |     gc.ttlseconds = 3600,
                                                                                                 |     num_replicas = 5,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  RANGE system                                                                                   | ALTER RANGE system CONFIGURE ZONE USING
                                                                                                 |     range_min_bytes = 134217728,
                                                                                                 |     range_max_bytes = 536870912,
                                                                                                 |     gc.ttlseconds = 90000,
                                                                                                 |     num_replicas = 5,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  RANGE liveness                                                                                 | ALTER RANGE liveness CONFIGURE ZONE USING
                                                                                                 |     range_min_bytes = 134217728,
                                                                                                 |     range_max_bytes = 536870912,
                                                                                                 |     gc.ttlseconds = 600,
                                                                                                 |     num_replicas = 5,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  TABLE system.public.replication_constraint_stats                                               | ALTER TABLE system.public.replication_constraint_stats CONFIGURE ZONE USING
                                                                                                 |     gc.ttlseconds = 600,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  TABLE system.public.replication_stats                                                          | ALTER TABLE system.public.replication_stats CONFIGURE ZONE USING
                                                                                                 |     gc.ttlseconds = 600,
                                                                                                 |     constraints = '[]',
                                                                                                 |     lease_preferences = '[]'
  PARTITION us_west OF INDEX movr.public.users@primary                                           | ALTER PARTITION us_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_east OF INDEX movr.public.users@primary                                           | ALTER PARTITION us_east OF INDEX movr.public.users@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION europe_west OF INDEX movr.public.users@primary                                       | ALTER PARTITION europe_west OF INDEX movr.public.users@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION us_west OF INDEX movr.public.vehicles@primary                                        | ALTER PARTITION us_west OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | ALTER PARTITION us_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_east OF INDEX movr.public.vehicles@primary                                        | ALTER PARTITION us_east OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users          | ALTER PARTITION us_east OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION europe_west OF INDEX movr.public.vehicles@primary                                    | ALTER PARTITION europe_west OF INDEX movr.public.vehicles@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users      | ALTER PARTITION europe_west OF INDEX movr.public.vehicles@vehicles_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION us_west OF INDEX movr.public.rides@primary                                           | ALTER PARTITION us_west OF INDEX movr.public.rides@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | ALTER PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | ALTER PARTITION us_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_east OF INDEX movr.public.rides@primary                                           | ALTER PARTITION us_east OF INDEX movr.public.rides@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users                | ALTER PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles     | ALTER PARTITION us_east OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION europe_west OF INDEX movr.public.rides@primary                                       | ALTER PARTITION europe_west OF INDEX movr.public.rides@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users            | ALTER PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_city_ref_users CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles | ALTER PARTITION europe_west OF INDEX movr.public.rides@rides_auto_index_fk_vehicle_city_ref_vehicles CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary                      | ALTER PARTITION us_west OF INDEX movr.public.vehicle_location_histories@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary                      | ALTER PARTITION us_east OF INDEX movr.public.vehicle_location_histories@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary                  | ALTER PARTITION europe_west OF INDEX movr.public.vehicle_location_histories@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
  TABLE movr.public.promo_codes                                                                  | ALTER TABLE movr.public.promo_codes CONFIGURE ZONE USING
                                                                                                 |     num_replicas = 3,
                                                                                                 |     constraints = '{+region=us-east1: 1}',
                                                                                                 |     lease_preferences = '[[+region=us-east1]]'
  INDEX movr.public.promo_codes@promo_codes_idx_us_west                                          | ALTER INDEX movr.public.promo_codes@promo_codes_idx_us_west CONFIGURE ZONE USING
                                                                                                 |     num_replicas = 3,
                                                                                                 |     constraints = '{+region=us-west1: 1}',
                                                                                                 |     lease_preferences = '[[+region=us-west1]]'
  INDEX movr.public.promo_codes@promo_codes_idx_europe_west                                      | ALTER INDEX movr.public.promo_codes@promo_codes_idx_europe_west CONFIGURE ZONE USING
                                                                                                 |     num_replicas = 3,
                                                                                                 |     constraints = '{+region=europe-west1: 1}',
                                                                                                 |     lease_preferences = '[[+region=europe-west1]]'
  PARTITION us_west OF INDEX movr.public.user_promo_codes@primary                                | ALTER PARTITION us_west OF INDEX movr.public.user_promo_codes@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-west1]'
  PARTITION us_east OF INDEX movr.public.user_promo_codes@primary                                | ALTER PARTITION us_east OF INDEX movr.public.user_promo_codes@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=us-east1]'
  PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary                            | ALTER PARTITION europe_west OF INDEX movr.public.user_promo_codes@primary CONFIGURE ZONE USING
                                                                                                 |     constraints = '[+region=europe-west1]'
(34 rows)
~~~
