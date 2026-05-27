The following deprecations/removals are announced in v25.3.

- The cluster setting `server.client_cert_expiration_cache.capacity` has been deprecated. The client certificate cache now evicts client certificates based on expiration time. #144181
- `IMPORT TABLE` as well `PGDUMP` and `MYSQLDUMP` formats of `IMPORT` are now fully removed. These have been deprecated since v23.2. #148248
- Removed the 'started' column in `SHOW JOBS`, which was a duplicate of the 'created' column.
 #148464
