-- SHOW CREATE TABLE devices;
-- root@localhost:26257/defaultdb>   table_name |                     create_statement
-- -------------+-----------------------------------------------------------
--   devices    | CREATE TABLE devices (
--              |     device_id UUID NOT NULL DEFAULT gen_random_uuid(),
--              |     temperature_readings DECIMAL[] NULL,
--              |     CONSTRAINT "primary" PRIMARY KEY (device_id ASC),
--              |     INVERTED INDEX temp_readings (temperature_readings),
--              |     FAMILY "primary" (device_id, temperature_readings)
--              | )

SELECT * FROM users where user_profile @> '{"location":"NYC"}';

SHOW CREATE TABLE devices;

SELECT temperature_readings FROM devices LIMIT 1;

WITH
	xs AS
    (SELECT temperature_readings FROM devices),
    
    
SELECT
	array_upper(xs::DECIMAL[], 1)


SELECT * FROM devices WHERE temperature_readings @> ARRAY[100]::DECIMAL[];

SELECT * FROM devices WHERE temperature_readings @> ARRAY[100::DECIMAL];



update t set j = json_set(j, '{a}'::string[], '789') where id = 1;
