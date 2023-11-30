FROM amazon/aws-lambda-nodejs:18

ENV DEBUG=*

ADD fixtures ${LAMBDA_TASK_ROOT}/fixtures

COPY package.json ${LAMBDA_TASK_ROOT}

COPY node_modules ${LAMBDA_TASK_ROOT}/node_modules

COPY index.js ${LAMBDA_TASK_ROOT}

CMD ["index.handler"]
