The workflow for MovR is as follows (with approximations of the corresponding SQL for each step):

1. A user loads the app and sees the 25 closest vehicles:

    ~~~ sql
    > SELECT id, city, status, ... FROM vehicles WHERE city = <user location>
    ~~~

2. The user signs up for the service:

    ~~~ sql
    > INSERT INTO users (id, name, address, ...) VALUES ...
    ~~~

3. In some cases, the user adds their own vehicle to share:

    ~~~ sql
    > INSERT INTO vehicles (id, city, type, ...) VALUES ...
    ~~~

4. More often, the user reserves a vehicle and starts a ride, applying a promo code, if available and valid:

    ~~~ sql
    > SELECT code FROM user_promo_codes WHERE user_id = ...
    ~~~

    ~~~ sql
    > UPDATE vehicles SET status = 'in_use' WHERE ...
    ~~~

    ~~~ sql
    > INSERT INTO rides (id, city, start_addr, ...) VALUES ...
    ~~~

5. During the ride, MovR tracks the location of the vehicle:   

    ~~~ sql
    > INSERT INTO vehicle_location_histories (city, ride_id, timestamp, lat, long) VALUES ...
    ~~~

6. The user ends the ride and releases the vehicle:

    ~~~ sql
    > UPDATE vehicles SET status = 'available' WHERE ...
    ~~~

    ~~~ sql
    > UPDATE rides SET end_address = <value> ...
    ~~~
