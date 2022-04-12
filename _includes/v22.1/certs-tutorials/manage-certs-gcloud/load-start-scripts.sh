echo "" > start_roach.sh
chmod +x ./start_roach.sh

# Node 1
cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node1addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo

gcloud compute scp ./start_roach.sh $node1name:~

# Start Node 2
cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node2addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo

gcloud compute scp ./start_roach.sh $node2name:~

# Start Node 3
cat <<ooo > start_roach.sh
cockroach start \
--certs-dir=certs \
--advertise-addr="${node3addr}" \
--join="${node1addr},${node2addr},${node3addr}" \
--cache=.25 \
--max-sql-memory=.25 \
--background
ooo

gcloud compute scp ./start_roach.sh $node3name:~


function start_roach_node {
    gcloud beta compute ssh --command 'chmod +x start_roach.sh && ./start_roach.sh' \
    $1
}

start_roach_node $node1name &
start_roach_node $node2name &
start_roach_node $node3name &