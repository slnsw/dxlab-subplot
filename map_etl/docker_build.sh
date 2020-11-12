#!/usr/bin/env bash
export DOCKER_BUILDKIT=1

IMAGE_NAME="dxmaps_etl"
#SSH_IDENTITY=${SSH_IDENTITY:-$SSH_AUTH_SOCK}

docker build $@ -t $IMAGE_NAME:0.0.1 -t $IMAGE_NAME:latest .
