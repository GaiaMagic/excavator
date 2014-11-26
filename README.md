excavator
=========

[![Circle CI](https://circleci.com/gh/lyoooooooo/excavator.png?style=badge&circle-token=e8a5950e00d4589038383412496b3efdb3cf233b)](
https://circleci.com/gh/lyoooooooo/excavator)

**ULTIMATE FORM GENERATOR** uses the MEAN framwork.

![excavator](https://cloud.githubusercontent.com/assets/1284703/5153881/1cd998ae-7279-11e4-8fd7-d50b369c69eb.jpg)

## Deploy

* Install `make`, `docker` and `fig`.
* Run `make` to build the images and start all containers.

This will create 4 containers:

* excavator_backend_1
* excavator_frontend_1
* excavator_db_1
* excavator_data_1

`excavator_data_1` is VERY IMPORTANT, because it has all the data. You must
NOT remove it once it's created. Other three containers/images are free to
remove/recreate.

* Run `make start` or `make restart` to recreate all containers.
* Run `make reload` if you want to rebuild front-end files.

You can now visit backend `curl localhost:43210 -i` and frontend
`ls /srv/excavator` on the host system.

By recreating images, you will find there are many `<none>` images in
`docker images`, you can use `make clean` to remove these old images.

Other useful `make` commands:

* `make help` to see help information
* `make db` to enter the MongoDB system
* `make mongo` to directly connect to db via `mongo`
* `make mongodump` to dump excavator database to current directory
* `make mongorestore` to restore the backed-up database in current directory
* `make mongorestore-drop` to drop before restore
* `make data` to enter where the MongoDB data files are
* `make node` to enter the system where the backend application runs
* `make dist` to view the source and the dist directory

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
