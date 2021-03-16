wget -qO- https://binaries.cockroachdb.com/cockroach-v20.2.6.linux-amd64.tgz | tar  xvz
cp -i cockroach-v20.2.6.linux-amd64/cockroach /usr/local/bin/
cockroach start-single-node --insecure
