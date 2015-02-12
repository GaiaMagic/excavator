GIT_ENV = GIT_HEAD_COMMIT="$(shell git rev-parse HEAD)" \
	GIT_HEAD_DATE="$(shell git --no-pager show --format="%ad" --quiet HEAD)" \
	GIT_HEAD_AUTHOR="$(shell git --no-pager show --format="%ae" --quiet HEAD)" \
	GIT_HEAD_FILE_COUNT="$(shell git ls-files | wc -l | xargs)" \
	$(1)

help:
	@printf ""\
	"  \033[0;36mmake all\033[0m            rebuild and start the application\n"\
	"  \033[0;36mmake dist release\033[0m   make frontend and make a new release\n"\
	"\n"\
	"  \033[0;36mmake clean\033[0m          remove useless docker images\n"\
	"  \033[0;36mmake test\033[0m           run npm test in a new container\n"\
	"\n"\
	"inspect data:\n"\
	"  \033[0;36mmake usercontent\033[0m    enter container to control usercontent\n"\
	"  \033[0;36mmake admincontent\033[0m   enter container to control admincontent\n"\
	"  \033[0;36mmake data\033[0m           enter where the MongoDB data files are\n"\
	"\n"\
	"use software:\n"\
	"  \033[0;36mmake db\033[0m             enter the MongoDB system\n"\
	"  \033[0;36mmake mongo\033[0m          directly connect to db via 'mongo'\n"\
	"  \033[0;36mmake node\033[0m           enter the system where the backend application runs\n"\
	"\n"\
	"for tranfering data between servers:\n"\
	"  \033[0;36mmake backup-data\033[0m    archive database\n"\
	"  \033[0;36mmake backup-usercontent\033[0m   archive usercontent\n"\
	"  \033[0;36mmake backup\033[0m         archive both\n"\
	"  \033[0;36mmake backup-clean\033[0m   clean existing archive\n"\
	"  \033[0;36mmake restore-data\033[0m   restore database\n"\
	"  \033[0;36mmake restore-usercontent\033[0m  restore usercontent\n"\
	"  \033[0;36mmake restore\033[0m        restore both\n"

all: update-images dist backend release

update: update-images dist update-backend release

update-images:
	cp Dockerfile.backend Dockerfile
	fig build backend
	cp Dockerfile.frontend Dockerfile
	fig build frontend
	rm -f Dockerfile

dist:
	$(call GIT_ENV,fig up frontend)

DBRUNNING = $(shell docker inspect --format '{{.State.Running}}' excavator_db_1 2>&1)
ifeq ($(DBRUNNING),true)
start-db:
	@echo "Database has already started"
else
start-db:
	fig up -d db data usercontent
endif

backend: start-db
	fig kill backend
	fig rm --force backend
	fig scale backend=2

update-backend: start-db
	docker kill excavator_backend_slave; true
	docker rm excavator_backend_slave; true
	docker run -d \
		-p="3000" \
		--link=excavator_db_1:db \
		--name excavator_backend_slave \
		--volumes-from=excavator_usercontent_1 \
		excavator_backend
	cd .. && make reload
	fig kill backend
	cd .. && make reload
	fig rm --force backend
	fig scale backend=2
	docker kill excavator_backend_slave; true
	cd .. && make reload
	docker rm excavator_backend_slave; true

release:
	docker run --rm -v="/srv/excavator/dist:/excavator/dist" \
	excavator_frontend gulp release

# other:

test:
	docker rm -f excavator_test >/dev/null 2>&1; true
	docker run -d --name excavator_test mongo:2.6.5 --noprealloc --nojournal >/dev/null
	docker run --rm --link=excavator_test:db excavator_frontend npm test
	docker rm -f excavator_test >/dev/null 2>&1; true

clean:
	docker images | grep '<none>' | awk '{print $$3}' | xargs docker rmi 2>/dev/null; true

db:
	docker run -it --rm --link excavator_db_1:mongo mongo:2.6.5 bash

mongo:
	docker run -it --rm --link excavator_db_1:mongo mongo:2.6.5 \
	sh -c 'exec mongo \
	$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/excavator'

data:
	docker run -it --rm --volumes-from=excavator_data_1 \
	--workdir=/data/db busybox

admincontent:
	docker run -it --rm --volumes-from=excavator_usercontent_1 \
	--workdir=/admincontent busybox

usercontent:
	docker run -it --rm --volumes-from=excavator_usercontent_1 \
	--workdir=/usercontent busybox

node:
	nsenter --target $$(docker inspect \
	--format "{{.State.Pid}}" excavator_backend_1) \
	--mount --uts --ipc --net --pid

backup: backup-data backup-admincontent backup-usercontent

backup-data-only:
	docker run --rm --link excavator_db_1:mongo \
	--volume="$$(pwd):/dump" mongo:2.6.5 \
	sh -c 'mongodump --host $$MONGO_PORT_27017_TCP_ADDR \
	--port $$MONGO_PORT_27017_TCP_PORT --db excavator -o /dump/backup && \
	chown -R $(shell id -u):$(shell id -u) /dump/backup'

backup-data: backup-data-only
	tar cfvz backup.tar.gz backup
	rm -rf backup

backup-admincontent:
	docker run --rm --volumes-from excavator_usercontent_1 \
	-v $$(pwd):/backup busybox tar cvf /backup/excavator_admincontent.tar /admincontent

backup-usercontent:
	docker run --rm --volumes-from excavator_usercontent_1 \
	-v $$(pwd):/backup busybox tar cvf /backup/excavator_usercontent.tar /usercontent

backup-clean:
	rm -f backup.tar.gz excavator_admincontent.tar excavator_usercontent.tar

restore: restore-data restore-admincontent restore-usercontent

restore-data:
	tar xfvz backup.tar.gz
	docker run --rm --link excavator_db_1:mongo \
	--volume="$$(pwd):/dump" mongo:2.6.5 \
	sh -c 'exec mongorestore --drop --host $$MONGO_PORT_27017_TCP_ADDR \
	--port $$MONGO_PORT_27017_TCP_PORT --db excavator /dump/backup/excavator'
	rm -rf backup

restore-admincontent:
	docker run --rm --volumes-from excavator_usercontent_1 \
	-v $$(pwd):/restore busybox tar xvf /restore/excavator_admincontent.tar

restore-usercontent:
	docker run --rm --volumes-from excavator_usercontent_1 \
	-v $$(pwd):/restore busybox tar xvf /restore/excavator_usercontent.tar

.PHONY: all backend backup clean data db dist frontend help mongo node release remove restore start test update usercontent
