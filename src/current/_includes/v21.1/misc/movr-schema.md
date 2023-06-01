The six tables in the `movr` database store user, vehicle, and ride data for MovR:

Table   |         Description          
--------|----------------------------
`users` | People registered for the service.       
`vehicles` | The pool of vehicles available for the service.
`rides` | When and where users have rented a vehicle.       
`promo_codes` | Promotional codes for users.
`user_promo_codes` | Promotional codes in use by users.      
`vehicle_location_histories` | Vehicle location history.

<img src="{{ 'images/v21.1/movr-schema.png' | relative_url }}" alt="Geo-partitioning schema" style="max-width:100%" />
