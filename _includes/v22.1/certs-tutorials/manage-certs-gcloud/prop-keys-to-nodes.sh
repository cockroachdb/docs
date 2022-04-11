gcloud compute ssh $node1name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node1/node.* ${node1name}:~/certs

gcloud compute ssh $node2name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node2/node.* ${node2name}:~/certs

gcloud compute ssh $node3name \
--command 'rm -rf ~/certs && mkdir ~/certs'

gcloud compute scp ./node3/node.* ${node3name}:~/certs