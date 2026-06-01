CREATE TABLE vehicles (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    type STRING,
    city STRING,
    owner_id UUID,
    date_added date,
    status STRING,
    last_location STRING,
    color STRING,
    brand STRING,
    CONSTRAINT fk_ref_users FOREIGN KEY (owner_id) REFERENCES users (id))
    LOCALITY REGIONAL BY ROW;
