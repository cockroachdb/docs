# Offline docs instructions

* Either:
  * Build the container: `./offline-docs/builder build`
  * Pull the container: `docker pull cockroachdb/offline-docs`.
  * Import the container: `docker load --input offline-docs.tar`.
* Run the container by running either:
  * `docker run --rm -it -p 4000:4000 cockroachdb/offline-docs`.
  * `./offline-docs/builder run`

# Exporting the container

* Once the container is built, run `docker save -o offline-docs.tar offline-docs`.
* Optionally, build the archive, run `tar czvf offline-docs.tar.gz OFFLINE-DOCS.md offline-docs.tar`.
