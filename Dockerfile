# При деплое ОБЯЗАТЕЛЬНО указывать все ENV через Jenkins

# Ставится в pipeline на Jenkins
ARG BRANCH=dev

FROM node

RUN apt -yqq update \
    && apt -yqq install git curl nginx \
    && apt clean

# NGINX CONFIGURE
RUN rm /etc/nginx/sites-enabled/default
COPY nginx/default /etc/nginx/sites-enabled

# INSTALL YARN
RUN corepack enable
RUN yarn init -2

# CHECKOUT
RUN git clone https://github.com/uniteam31/unishare-backend.git
WORKDIR /unishare-backend
RUN git fetch --all
RUN git pull
RUN git checkout ${BRANCH}

# INSTALL DEPS
RUN yarn install
RUN yarn build

WORKDIR /unishare-backend/dist

EXPOSE 8000

CMD ["node", "main.js"]
