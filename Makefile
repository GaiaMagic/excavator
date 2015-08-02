help:
	@printf ""\
	"  \033[0;36mmake test\033[0m           run npm test in a new container\n"\
	"  \033[0;36mmake mongo\033[0m          directly connect to db via 'mongo'\n"\
	"\n"\
	"for tranfering data between servers:\n"\
	"  \033[0;36mmake backup-data\033[0m    archive database\n"\
	"  \033[0;36mmake backup-usercontent\033[0m   archive usercontent\n"\
	"  \033[0;36mmake backup\033[0m         archive both\n"\
	"  \033[0;36mmake backup-clean\033[0m   clean existing archive\n"\
	"  \033[0;36mmake restore-data\033[0m   restore database\n"\
	"  \033[0;36mmake restore-usercontent\033[0m  restore usercontent\n"\
	"  \033[0;36mmake restore\033[0m        restore both\n"

test:
	docker rm -f excavator_test >/dev/null 2>&1; true
	docker run -d --name excavator_test mongo:2.6.5 --noprealloc --nojournal >/dev/null
	docker run --rm --link=excavator_test:db excavator_frontend npm test
	docker rm -f excavator_test >/dev/null 2>&1; true

mongo:
	docker run -it --rm --link excavator_db_1:mongo mongo:2.6.5 \
	sh -c 'exec mongo \
	$$MONGO_PORT_27017_TCP_ADDR:$$MONGO_PORT_27017_TCP_PORT/excavator'

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
	docker run --rm -v "/srv/excavator/admincontent:/admincontent" \
	-v $$(pwd):/backup mongo:2.6.5 tar cvf /backup/excavator_admincontent.tar /admincontent

backup-usercontent:
	docker run --rm -v "/srv/excavator/usercontent:/usercontent" \
	-v $$(pwd):/backup mongo:2.6.5 tar cvf /backup/excavator_usercontent.tar /usercontent

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
	docker run --rm -v "/srv/excavator/admincontent:/admincontent" \
	-v "$$(pwd):/restore" mongo:2.6.5 tar xvf /restore/excavator_admincontent.tar

restore-usercontent:
	docker run --rm -v "/srv/excavator/usercontent:/usercontent" \
	-v $$(pwd):/restore mongo:2.6.5 tar xvf /restore/excavator_usercontent.tar

.PHONY: all backend backup data db dist frontend help mongo node release remove restore start test update usercontent
