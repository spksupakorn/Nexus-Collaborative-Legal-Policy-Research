FROM docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# Install Thai language analysis plugin
RUN elasticsearch-plugin install analysis-icu

# Create directory for custom configuration
RUN mkdir -p /usr/share/elasticsearch/config/analysis

USER elasticsearch
