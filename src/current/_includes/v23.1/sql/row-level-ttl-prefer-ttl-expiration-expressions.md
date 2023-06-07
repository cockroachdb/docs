Starting with CockroachDB v22.2, we recommend that most users use `ttl_expiration_expression` over `ttl_expire_after` for the following reasons:

- If you use `ttl_expiration_expression`, you can use an existing [`TIMESTAMPTZ`](timestamp.html) column called e.g. `updated_at`.
- If you use `ttl_expire_after`, it will cause a full table rewrite, which can affect performance.  Also, you can't use it with an existing [`TIMESTAMPTZ`](timestamp.html) column.
