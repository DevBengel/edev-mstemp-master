FROM centos
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN npm install mysql
RUN npm install express
RUN mkdir /var/mstemp
COPY server.js /var/mstemp/server.js
WORKDIR /var/mstemp
EXPOSE 9001
ENTRYPOINT ["node"]
CMD ["server.js"]
