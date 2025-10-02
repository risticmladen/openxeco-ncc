FROM python:3.9-slim

ENV PYTHONUNBUFFERED=1

ARG ENVIRONMENT=development

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    pkg-config \
    default-libmysqlclient-dev \
    libffi-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    python3-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app

RUN pip install --upgrade pip setuptools wheel
RUN pip install gunicorn

COPY oxe-api/requirements.txt /usr/app/
RUN pip install 'marshmallow<4.0.0,>=3.0.0'
RUN pip install python-magic
RUN pip install -r requirements.txt

COPY oxe-api/* /usr/app/

COPY .docker/entrypoint.sh /entrypoint.sh

COPY . .

RUN chmod +x /entrypoint.sh

CMD /entrypoint.sh
