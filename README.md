excavator
=========

[![Circle CI](https://circleci.com/gh/lyoooooooo/excavator.png?style=badge&circle-token=e8a5950e00d4589038383412496b3efdb3cf233b)](
https://circleci.com/gh/lyoooooooo/excavator)

**ULTIMATE FORM GENERATOR** uses the MEAN framwork.

![excavator](https://cloud.githubusercontent.com/assets/1284703/5153881/1cd998ae-7279-11e4-8fd7-d50b369c69eb.jpg)

## CLI

```
# run locally
./excavator [admin|manager] [create|delete|list|reset-password] ...

# run in a running backend container
docker exec -it excavator_backend_1 ./excavator [admin|manager] ...
```

## Test

```
# install and start mongod, then
# run these commands to start testing:

npm install
npm test

# manually do tests

alias mocha='./node_modules/mocha/bin/mocha'
mocha [-w|--watch] [some-file-test.js] [-g|--grep 'grep']

# run tests in container
make test
```
