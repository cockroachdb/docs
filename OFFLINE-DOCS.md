# Offline docs instructions

* Either:
  * Build the container: `docker build -t offline-docs .`
  * Pull the container: `docker pull offline-docs`.
  * Import the container: `docker load --input offline-docs.tar`.
* Run the container: `docker run --rm -it -p 4000:4000 offline-docs`.

# Exporting the container

* Once the container is built, run `docker save -o offline-docs.tar offline-docs`.
* Optionally, build the archive, run `tar czvf offline-docs.tar.gz OFFLINE-DOCS.md offline-docs.tar`.
