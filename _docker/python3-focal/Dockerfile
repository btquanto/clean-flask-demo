FROM ubuntu:focal

# Variables
ENV APP_DIR /src
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8
ENV TZ=Asia/Ho_Chi_Minh

# Time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# App dir
RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}

# Upgrade apt cache
RUN apt-get update && apt-get upgrade -y && apt-get dist-upgrade -y 

# Install neccesaries
RUN apt-get install -y \
                python3 python3-pip python3-tk python3-dev python3-setuptools \
                vim curl git wget zip unzip net-tools openssl virtualenv \
                ca-certificates build-essential checkinstall \
                default-libmysqlclient-dev \
                libbz2-dev libc6-dev libffi-dev libgdbm-dev libncursesw5-dev \
                libreadline-gplv2-dev libsqlite3-dev libssl-dev \
                libc-client-dev libfreetype6-dev libmcrypt-dev libpng-dev libjpeg-dev \
                libldap2-dev libkrb5-dev libtidy-dev libzip-dev libsodium-dev \
                tk-dev zlib1g-dev \
                gettext ffmpeg \
        && pip3 install -U pip wheel virtualenv

# Remove downloaded package files to reduce image size
RUN apt-get clean -y

# Entrypoint
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh
RUN ln -s /usr/local/bin/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]