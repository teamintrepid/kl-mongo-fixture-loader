#!/bin/bash -e
# Remove and clean all containers
sudo docker stop $(sudo docker ps -a -q) || true
sudo docker rm `sudo docker ps -a -q` || true
sudo docker rmi `sudo docker images -q` || true

# Set tag, if it hasnt been set
if [ -z ${tag+x} ]
then 
  branch=${GIT_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}
  [[ $branch =~ ([a-zA-Z-]+\/)*([a-zA-Z0-9]+-*[a-zA-Z0-9]+) ]] 
  match=${BASH_REMATCH[2]}
  tag=$(echo "$match" | awk '{print tolower($0)}')
fi

# Build
sudo docker build -t kentandlime/kal-dep-fixtures-bau:$tag --no-cache .

# Run Mongo/Module tests
sudo docker run -d --name db mongo:3.2.4
sudo docker run -td --name module --link db:mongo kentandlime/kal-dep-fixtures-bau:$tag

# Exec tests
sudo docker exec module /bin/bash -c 'npm run lint'
sudo docker exec module /bin/bash -c 'npm test'

# Clean up
sudo docker stop db || true
sudo docker stop module || true
sudo docker rm -f module db || true
