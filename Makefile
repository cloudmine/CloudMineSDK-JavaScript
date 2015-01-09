run:
	node js/cloudmine.js

unit:
	@echo "no unit tests yet"

integration:
	CLOUDMINE_APPID=793dcffc4f67f94c36a8f20628d3d31b \
	CLOUDMINE_APIKEY=8b05c2e5d0e88b471c5aae8ba6cf9f7b \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

test:
	$(MAKE) unit
	$(MAKE) integration

kill-node:
	-kill `ps -eo pid,comm | awk '$$2 == "node" { print $$1 }'`

.PHONY: test unit run
