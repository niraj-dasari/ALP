#!/bin/bash

echo "Creating deployment dir..."
./scripts/prepare-deployment-dir.sh

export DEPLOYMENT_DIR=<>

cd $DEPLOYMENT_DIR

if [ -f ./seed.sh ] ; then
	echo "Executing seed.sh..."
	./seed.sh
fi
