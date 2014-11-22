excavator
=========

[![Circle CI](https://circleci.com/gh/lyoooooooo/excavator.png?style=badge&circle-token=e8a5950e00d4589038383412496b3efdb3cf233b)](
https://circleci.com/gh/lyoooooooo/excavator)

**ULTIMATE FORM GENERATOR** uses the MEAN framwork.

![excavator](https://cloud.githubusercontent.com/assets/1284703/5153881/1cd998ae-7279-11e4-8fd7-d50b369c69eb.jpg)

## Deploy

* Install `docker` and `fig`.
* Run `fig up -d`.
* Configure `nginx`.

## Test

```
# install and start mongod, then
# run these commands to start testing:

npm install
npm test

# manually do tests

alias mocha='./node_modules/mocha/bin/mocha'
mocha [-w|--watch] [some-file-test.js] [-g|--grep 'grep']
```
