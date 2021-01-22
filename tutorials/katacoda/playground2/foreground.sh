docker pull cockroachdb/cockroach:v20.2.4
docker volume create roach1
docker run -d --name=roach1 --hostname=roach1 -p 26257:26257 -p 8080:8080  -v "roach1:/cockroach/cockroach-data"  cockroachdb/cockroach:v20.2.4 start-single-node --insecure
docker exec -it roach1 ./cockroach sql --insecure
