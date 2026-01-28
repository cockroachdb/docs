

## Local Development for writers

Prerequisites: [Docker](https://www.docker.com/products/docker-desktop/)

```bash
# Pull the docs builder image
make docker-pull

# Serve docs locally with live reload
make docker-serve
```

Open http://localhost:4000/docs/ in your browser. Changes to files will automatically reload.

