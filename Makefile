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
	fig up -d

restart: start

reload:
	# this will rebuild front-end files
	fig up -d --no-recreate

clean:
	@sudo docker images | grep -q '<none>' && \
	sudo docker images | awk 'NR==1||/<none>/' && echo \
	"Press Enter to remove this 'none' images." && read ANS && \
	sudo docker images | grep '<none>' | awk '{print $$3}' | \
		xargs -n1 sudo docker rmi || echo "Nothing to clean."
