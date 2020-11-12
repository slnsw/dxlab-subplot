# syntax=docker/dockerfile:experimental

# Using docker command directlry don't forget to set DOCKER_BUILDKIT=1
# otherwise use docker_build.sh script.

# Build stage
ARG PYTHON_VERSION=3.7-slim-buster

FROM python:${PYTHON_VERSION} as build

ENV PYTHONUNBUFFERED 1

RUN apt-get update -y  \
    && apt-get -y install --no-install-recommends openssh-client git \
    && apt-get -y install --no-install-recommends libxslt-dev libxml2-dev \
    # download public key for github.com
    && mkdir -p ~/.ssh \
    && ssh-keyscan github.com > ~/.ssh/known_hosts
RUN pip install --upgrade pip \
    && pip install poetry==1.0.5

ENV PYROOT /pyroot
ENV VIRTUAL_ENV $PYROOT
ENV PATH $PYROOT/bin:$PATH
ENV PYTHONPATH=$PYROOT/lib/python:$PATH:/src:$PATH \
    # This is crucial for pkg_resources to work
    PYTHONUSERBASE=$PYROOT

ENV POETRY_VIRTUALENVS_IN_PROJECT=0 \
    POETRY_VIRTUALENVS_CREATE=0 \
    POETRY_VIRTUALENVS_PATH=$PYROOT

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_IGNORE_INSTALLED=1 \
    PIP_NO_CACHE_DIR=0
# PIP_TARGET=$PYROOT
# PIP_USER=1

# Create and active virtual env
RUN python -m venv $PYROOT

WORKDIR /src

COPY pyproject.toml /src/pyproject.toml
COPY poetry.lock /src/poetry.lock

# Install python packages
RUN --mount=type=ssh poetry install --no-dev --no-interaction --no-ansi --no-root


# Copy source dode
COPY . /src


# Production stage
# FROM python:${PYTHON_VERSION} as prod
FROM gcr.io/distroless/python3-debian10
ENV PYTHONUNBUFFERED=1

ENV PYROOT /pyroot
ENV PATH $PYROOT/bin:$PATH
# Also add project to systempath
ENV PYTHONPATH $PYROOT/lib/python:/src:$PATH
# This is crucial for pkg_resources to work
ENV PYTHONUSERBASE $PYROOT


# Finally, copy artifacts
COPY --from=build $PYROOT $PYROOT
COPY --from=build /src /src


WORKDIR /src

VOLUME [ "/src/logs", "/src/data" ]

ENTRYPOINT ["python", "cli.py"]
CMD ["python", "cli.py"]