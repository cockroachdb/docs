#!/usr/bin/env bash
set -e

if ! which cockroach 2> /dev/null > /dev/null; then
  echo "Please make sure cockroach is in your path"
  exit 1
fi

if ! which openssl 2> /dev/null > /dev/null; then
  echo "Please make sure openssl is installed and in your path"
  exit 1
fi

CCERTS="cockroach_certs"
OSCERTS="openssl_certs"
rm -rf ${CCERTS}
rm -rf ${OSCERTS}
mkdir -p ${CCERTS}
mkdir -p ${OSCERTS}

# COCKROACH:
# Create CA cert and key.
cockroach cert create-ca --certs-dir=${CCERTS} --ca-key=${CCERTS}/ca.key
# Create node cert and key.
cockroach cert create-node --certs-dir=${CCERTS} --ca-key=${CCERTS}/ca.key localhost 127.0.0.1 myhost.mydomain.com
# Create client cert and key.
cockroach cert create-client --certs-dir=${CCERTS} --ca-key=${CCERTS}/ca.key maxroach

# OPENSSL:
# Key creation equivalent:
# openssl genrsa -out ${OSCERTS}/ca.key 2048 2> /dev/null
# chmod 400 ${OSCERTS}/ca.key

# But we use the cockroach-generated keys to be able to compare certs.
cp ${CCERTS}/ca.key ${OSCERTS}/ca.key
cp ${CCERTS}/node.key ${OSCERTS}/node.key
cp ${CCERTS}/client.maxroach.key ${OSCERTS}/client.maxroach.key

# Create CA certificate.
openssl req \
  -new \
  -x509 \
  -config ca.conf \
  -key ${CCERTS}/ca.key \
  -out ${OSCERTS}/ca.crt \
  -days 3660 \
  -batch

# Reset database and index files.
rm -f index.txt serial.txt
touch index.txt
echo '01' > serial.txt

# Create Node certificate signing request.
# We reuse the cockroach node key.
openssl req \
  -new \
  -config node.conf \
  -key ${OSCERTS}/node.key \
  -out ${OSCERTS}/node.csr \
  -batch

# Sign the CSR using the CA key.
# We override the number of days.
openssl ca \
  -config ca.conf \
  -keyfile ${OSCERTS}/ca.key \
  -cert ${OSCERTS}/ca.crt \
  -policy signing_policy \
  -extensions signing_node_req \
  -out ${OSCERTS}/node.crt \
  -outdir ${OSCERTS}/ \
  -in ${OSCERTS}/node.csr \
  -days 1830 \
  -batch

# Create client certificate signing request.
# We reuse the cockroach client key for maxroach.
openssl req \
  -new \
  -config client.conf \
  -key ${OSCERTS}/client.maxroach.key \
  -out ${OSCERTS}/client.maxroach.csr \
  -batch

# Sign the CSR using the CA key.
# We override the number of days.
openssl ca \
  -config ca.conf \
  -keyfile ${OSCERTS}/ca.key \
  -cert ${OSCERTS}/ca.crt \
  -policy signing_policy \
  -extensions signing_client_req \
  -out ${OSCERTS}/client.maxroach.crt \
  -outdir ${OSCERTS}/ \
  -in ${OSCERTS}/client.maxroach.csr \
  -days 1830 \
  -batch


# Turn certs into plain text.
openssl x509 -noout -text -in ${CCERTS}/ca.crt > ${CCERTS}/ca.crt.text
openssl x509 -noout -text -in ${CCERTS}/node.crt > ${CCERTS}/node.crt.text
openssl x509 -noout -text -in ${CCERTS}/client.maxroach.crt > ${CCERTS}/client.maxroach.crt.text
openssl x509 -noout -text -in ${OSCERTS}/ca.crt > ${OSCERTS}/ca.crt.text
openssl x509 -noout -text -in ${OSCERTS}/node.crt > ${OSCERTS}/node.crt.text
openssl x509 -noout -text -in ${OSCERTS}/client.maxroach.crt > ${OSCERTS}/client.maxroach.crt.text

set +e
# Show diff: only the serial, start date, and signature should differ.
echo ""
echo "########################################"
echo "diff ${CCERTS}/ca.crt.text ${OSCERTS}/ca.crt.text"
echo ""
diff ${CCERTS}/ca.crt.text ${OSCERTS}/ca.crt.text

echo ""
echo "########################################"
echo "diff ${CCERTS}/node.crt.text ${OSCERTS}/node.crt.text"
echo ""
diff ${CCERTS}/node.crt.text ${OSCERTS}/node.crt.text

echo ""
echo "########################################"
echo "diff ${CCERTS}/client.maxroach.crt.text ${OSCERTS}/client.maxroach.crt.text"
echo ""
diff ${CCERTS}/client.maxroach.crt.text ${OSCERTS}/client.maxroach.crt.text
