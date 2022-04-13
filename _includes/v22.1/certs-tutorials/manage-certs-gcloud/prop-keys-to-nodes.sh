gcloud compute ssh $node1name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./$node1name/node.* ${node1name}:~/certs

gcloud compute ssh $node2name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./$node2name/node.* ${node2name}:~/certs

gcloud compute ssh $node3name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./$node3name/node.* ${node3name}:~/certs


gcloud privateca roots describe \
$node_CA --pool roach-test-CA3-pool --format json \
| jq -r '.pemCaCertificates[]' > certs/ca.crt

gcloud privateca roots describe \
$client_CA --pool roach-test-CA3-pool --format json \
| jq -r '.pemCaCertificates[]' > certs/ca-client.crt

gcloud compute scp certs/ca.crt ${node1name}:~/certs
gcloud compute scp certs/ca.crt ${node2name}:~/certs
gcloud compute scp certs/ca.crt ${node3name}:~/certs

gcloud compute scp certs/ca-client.crt ${node1name}:~/certs
gcloud compute scp certs/ca-client.crt ${node2name}:~/certs
gcloud compute scp certs/ca-client.crt ${node3name}:~/certs