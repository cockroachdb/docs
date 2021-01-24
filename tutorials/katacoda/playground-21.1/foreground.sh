echo 'Installing a testing release of CockroachDB v21.1 and supporting spatial libraries...'

wget -qO- https://binaries.cockroachdb.com/cockroach-v21.1.0-alpha.1.linux-amd64.tgz | tar  xvz
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/cockroach /usr/local/bin/
mkdir -p /usr/local/lib/cockroach
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/

echo 'Starting a secure single-node cluster...'

mkdir certs my-safe-directory
cockroach cert create-ca --certs-dir=certs --ca-key=my-safe-directory/ca.key
cockroach cert create-node localhost $(hostname) --certs-dir=certs --ca-key=my-safe-directory/ca.key
cockroach cert create-client root --certs-dir=certs --ca-key=my-safe-directory/ca.key
cockroach start-single-node --certs-dir=certs --listen-addr=localhost:26257 --http-addr=localhost:8080 --background

echo 'Loading a sample database...'

cockroach workload init movr 'postgres://root@localhost:26257?sslmode=verify-full&sslrootcert=certs/ca.crt&sslcert=certs/client.root.crt&sslkey=certs/client.root.key'

echo 'Opening an interactive SQL shell and listing tables in the sample database...'

cockroach sql --database=movr --certs-dir=certs
SHOW TABLES;
