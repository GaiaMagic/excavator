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

# this will rebuild front-end files
reload:
	$(call GIT_ENV,fig up -d --no-recreate)

clean:
	@sudo docker images | grep -q '<none>' && \
	sudo docker images | awk 'NR==1||/<none>/' && echo \
	"Press Enter to remove this 'none' images." && read ANS && \
	sudo docker images | grep '<none>' | awk '{print $$3}' | \
		xargs -n1 sudo docker rmi || echo "Nothing to clean."
