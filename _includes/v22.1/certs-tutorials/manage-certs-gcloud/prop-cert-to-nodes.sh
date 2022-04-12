gcloud compute scp certs/ca.crt ${node1name}:~/certs
gcloud compute scp certs/ca.crt ${node2name}:~/certs
gcloud compute scp certs/ca.crt ${node3name}:~/certs

gcloud compute scp certs/ca-client.crt ${node1name}:~/certs
gcloud compute scp certs/ca-client.crt ${node2name}:~/certs
gcloud compute scp certs/ca-client.crt ${node3name}:~/certs