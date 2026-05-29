CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  city STRING NOT NULL,
  first_name STRING,
  last_name STRING,
  email STRING,
  username STRING,
  password_hash STRING,
  is_owner bool,
  UNIQUE INDEX users_username_key (username ASC))
  LOCALITY REGIONAL BY ROW;
