# base image with node and compass installed, dockerfile is in /docker in this repo.
# build locally with 'docker build -t plattar/base-alpine-node' and push to update
# WARNING - the base image is public, so should not contain any plattar IP or configuration
# that may give context/info about our servers to any potential attacker.
FROM alpine:3.8

RUN apk --no-cache add nodejs-current nodejs-current-npm git curl


#setup src
RUN mkdir -p /var/configurator && mkdir -p /var/configurator/dist
WORKDIR /var/configurator
ADD /app /var/configurator

ADD ./build.sh /usr/bin/build.sh
RUN chmod +x /usr/bin/build.sh
RUN /usr/bin/build.sh

# Set the default command to run when starting the container
ADD ./start.sh /usr/bin/start.sh
RUN chmod 770 /usr/bin/start.sh
ENTRYPOINT ["/bin/sh", "/usr/bin/start.sh"]