cat << EOF > /opt/configure-environment.sh
#!/bin/bash
cockroach demo
EOF
chmod +x /opt/configure-environment.sh
