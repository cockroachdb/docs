The workflow for MovR is as follows (with approximations of the corresponding SQL and some executable examples for each step):

1. A user loads the app and sees the 25 closest vehicles:

    ~~~ sql
    > SELECT id, city, status, ... FROM vehicles WHERE city = <user location>
    ~~~
    
    Executable example:
    
    ~~~ sql
    > SELECT id, city, status FROM vehicles WHERE city='amsterdam' limit 25;
    ~~~   

2. The user signs up for the service:

    ~~~ sql
    > INSERT INTO users (id, name, address, ...) VALUES ...
    ~~~
    
     Executable example:
     
     ~~~ sql
    > INSERT INTO users (id, name, address, city, credit_card) values ('66666666-6666-4400-8000-00000000000f','Mariah Lam','88194 Angela Gardens Suite 60','amsterdam','123245696');
    ~~~      
    
    Note: Usually for Universally Unique Identifier (UUID) you would need to generate it automatically but for the sake of this follow up we will use predetermined UUID to keep track of them in our examples.

3. In some cases, the user adds their own vehicle to share:

    ~~~ sql
    > INSERT INTO vehicles (id, city, type, ...) VALUES ...
    ~~~
    
    Executable example:
    
     ~~~ sql
    > INSERT INTO vehicles (id, city, type, owner_id,creation_time,status, current_location, ext) VALUES ('ffffffff-ffff-4400-8000-00000000000f','amsterdam', 'skateboard','66666666-6666-4400-8000-00000000000f',current_timestamp(),'available','88194 Angela Gardens Suite 60','{"color": "blue"}');
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
    
    Executable examples:
    
    ~~~ sql
    > SELECT code FROM user_promo_codes WHERE user_id ='66666666-6666-4400-8000-00000000000f';
    ~~~

    ~~~ sql
    > UPDATE vehicles SET status = 'in_use' WHERE id='bbbbbbbb-bbbb-4800-8000-00000000000b';
    ~~~

    ~~~ sql
    > INSERT INTO rides (id, city, vehicle_city, rider_id, vehicle_id, start_address,end_address, start_time, end_time, revenue) VALUES ('cd032f56-cf1a-4800-8000-00000000066f', 'amsterdam','amsterdam','66666666-6666-4400-8000-00000000000f','bbbbbbbb-bbbb-4800-8000-00000000000b','70458 Mary Crest','',TIMESTAMP '2020-10-01 10:00:00.123456',NULL,0.0);
    ~~~    

5. During the ride, MovR tracks the location of the vehicle:   

    ~~~ sql
    > INSERT INTO vehicle_location_histories (city, ride_id, timestamp, lat, long) VALUES ...
    ~~~
    
    Executable example:
    
    ~~~ sql
    > INSERT INTO vehicle_location_histories (city, ride_id, timestamp, lat, long) VALUES ('amsterdam','cd032f56-cf1a-4800-8000-00000000066f',current_timestamp(), -101, 60);
    ~~~    
    

6. The user ends the ride and releases the vehicle:

    ~~~ sql
    > UPDATE vehicles SET status = 'available' WHERE ...
    ~~~

    ~~~ sql
    > UPDATE rides SET end_address = <value>, end_time = <value>, ... WHERE ...
    ~~~
    
    Executable examples:
    
    ~~~ sql
    > UPDATE vehicles SET status = 'available' WHERE id='bbbbbbbb-bbbb-4800-8000-00000000000b';
    ~~~

    ~~~ sql
    > UPDATE rides SET end_address ='33862 Charles Junctions Apt. 49', end_time=TIMESTAMP '2020-10-01 10:30:00.123456', revenue=88.6 where id='cd032f56-cf1a-4800-8000-00000000066f';
    ~~~
