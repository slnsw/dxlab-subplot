#!/usr/bin/env bash

# Detect OS
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     OS=Linux;;
    Darwin*)    OS=Mac;;
    *)          OS="UNKNOWN:${unameOut}"
esac

# Set docker path if not found as argurment
if [ -z "$DOCKER_PATH" ]; then
    case "${OS}" in
        Linux*)     DOCKER_PATH=/usr/bin/docker;;
        Mac*)       DOCKER_PATH=/usr/local/bin/docker;;
    esac
fi

IMAGE_NAME=${IMAGE_NAME:-"dxmaps_etl"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# Set working directory to the directory where this script is located
cd "$(dirname "$0")"

DOCKER_EXTRA_ARGS=${DOCKER_EXTRA_ARGS:-""}

echo "$IMAGE_NAME:$IMAGE_TAG Running command -> $@"
$DOCKER_PATH run -it -m=10g -v dxmaps_logs:/src/logs  --mount type=bind,source=/home/dxmap/data/comaster_data/,target=/comaster_data  --rm $DOCKER_EXTRA_ARGS --name=dxmaps_etl_runner --env-file ./.env --network=host $IMAGE_NAME:$IMAGE_TAG $@