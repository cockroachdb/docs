CREATE TABLE rides (
  id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  city STRING NOT NULL,
  vehicle_id uuid,
  rider_id uuid,
  start_location STRING,
  end_location STRING,
  start_time timestamptz,
  end_time timestamptz,
  length interval,
  CONSTRAINT fk_city_ref_users FOREIGN KEY (rider_id) REFERENCES users (id),
  CONSTRAINT fk_vehicle_ref_vehicles FOREIGN KEY (vehicle_id) REFERENCES vehicles (id))
  LOCALITY REGIONAL BY ROW;
