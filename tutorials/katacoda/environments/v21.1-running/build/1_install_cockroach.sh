wget -qO- https://binaries.cockroachdb.com/cockroach-v21.1.0-alpha.1.linux-amd64.tgz | tar  xvz
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/cockroach /usr/local/bin/
mkdir -p /usr/local/lib/cockroach
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/lib/libgeos.so /usr/local/lib/cockroach/
cp -i cockroach-v21.1.0-alpha.1.linux-amd64/lib/libgeos_c.so /usr/local/lib/cockroach/
