DOCKER = $(shell which docker 2>/dev/null)
ifeq ($(strip $(DOCKER)),)
$(error Docker does not exist! You can download it from https://www.docker.com/)
endif

FIG = $(shell which fig 2>/dev/null)
ifeq ($(strip $(FIG)),)
$(error Fig does not exist! You can download it from http://www.fig.sh/)
endif

GIT_ENV = @GIT_HEAD_COMMIT="$(shell git rev-parse HEAD)" \
	GIT_HEAD_DATE="$(shell git --no-pager show --format="%ad" --quiet HEAD)" \
	GIT_HEAD_AUTHOR="$(shell git --no-pager show --format="%ae" --quiet HEAD)" \
	GIT_HEAD_FILE_COUNT="$(shell git ls-files | wc -l | xargs)" \
	GIT_USER="$(shell git config --get user.email)" \
	$(1)

all: backend frontend start clean

backend:
	mv Dockerfile.backend Dockerfile
	fig build backend
	mv Dockerfile Dockerfile.backend

frontend:
	mv Dockerfile.frontend Dockerfile
	fig build frontend
	mv Dockerfile Dockerfile.frontend

start:
	$(call GIT_ENV,fig up -d)

restart: start

reload:
	$(call GIT_ENV,fig up -d --no-recreate)

clean:
	@sudo docker images | grep -q '<none>' && \
	sudo docker images | awk 'NR==1||/<none>/' && echo \
	"Press Enter to remove these useless old '<none>' images." && read ANS && \
	sudo docker images | grep '<none>' | awk '{print $$3}' | \
		xargs -n1 sudo docker rmi || echo "Good! No useless images to clean."

help:
	@printf ""\
	"  \033[0;36mmake\033[0m                rebuild and start the application\n"\
	"  \033[0;36mmake start\033[0m          restart the application\n"\
	"  \033[0;36mmake reload\033[0m         rebuild frontend\n"\
	"  \033[0;36mmake clean\033[0m          remove useless docker images\n"\
	"\n"\
	"  \033[0;36mmake db\033[0m             enter the MongoDB system\n"\
	"  \033[0;36mmake mongo\033[0m          directly connect to db via 'mongo'\n"\
	"  \033[0;36mmake mongodump\033[0m      dump excavator database to current directory\n"\
	"  \033[0;36mmake mongorestore\033[0m   restore the backed-up database in current directory\n"\
	"  \033[0;36mmake mongorestore-drop\033[0m   drop before restore\n"\
	"  \033[0;36mmake data\033[0m           enter where the MongoDB data files are\n"\
	"  \033[0;36mmake node\033[0m           enter the system where the backend application runs\n"\
	"  \033[0;36mmake dist\033[0m           view the source and the dist directory\n"

db:
	sudo docker run -it --rm --link excavator_db_1:mongo mongo:2.6.5 bash

mongo:
	sudo docker run -it --rm --link excavator_db_1:mongo mongo:2.6.5 \
	sh -c 'exec mongo \
	$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/excavator'

mongodump:
	sudo docker run -it --rm --link excavator_db_1:mongo \
	--volume="$$(pwd):/dump" mongo:2.6.5 \
	sh -c 'exec mongodump --host $$MONGO_PORT_27017_TCP_ADDR \
	--port $$MONGO_PORT_27017_TCP_PORT --db excavator -o /dump'

mongorestore:
	sudo docker run -it --rm --link excavator_db_1:mongo \
	--volume="$$(pwd):/dump" mongo:2.6.5 \
	sh -c 'exec mongorestore --host $$MONGO_PORT_27017_TCP_ADDR \
	--port $$MONGO_PORT_27017_TCP_PORT --db excavator /dump/excavator'

mongorestore-drop:
	sudo docker run -it --rm --link excavator_db_1:mongo \
	--volume="$$(pwd):/dump" mongo:2.6.5 \
	sh -c 'exec mongorestore --drop --host $$MONGO_PORT_27017_TCP_ADDR \
	--port $$MONGO_PORT_27017_TCP_PORT --db excavator /dump/excavator'

data:
	sudo docker run -it --rm --volumes-from=excavator_data_1 \
	--workdir=/data/db busybox

usercontent:
	sudo docker run -it --rm --volumes-from=excavator_usercontent_1 \
	--workdir=/usercontent busybox

node:
	sudo nsenter --target $$(sudo docker inspect \
	--format "{{.State.Pid}}" excavator_backend_1) \
	--mount --uts --ipc --net --pid

dist:
	sudo docker run -it --rm --volumes-from=excavator_frontend_1 \
	--workdir=/excavator excavator_frontend bash
