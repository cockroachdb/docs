wget -qO- https://binaries.cockroachdb.com/cockroach-v20.1.7.linux-amd64.tgz | tar  xvz
cp -i cockroach-v20.1.7.linux-amd64/cockroach /usr/local/bin/
cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080
