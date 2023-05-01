ARG VARIANT="20"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && ./aws/install \
  && rm -rf ./aws awscliv2.zip \
  && npm -g install typescript \
  && npm install -g aws-cdk \
  && npm install -g npm-check-updates
RUN curl -sL -O https://github.com/kayac/ecspresso/releases/download/v2.0.0/ecspresso_2.0.0_linux_amd64.tar.gz \
  && tar -zxvf ecspresso_2.0.0_linux_amd64.tar.gz \
  && sudo install ecspresso /usr/local/bin/ecspresso \
  && rm -f LICENSE README.md ecspresso ecspresso_2.0.0_linux_amd64.tar.gz
