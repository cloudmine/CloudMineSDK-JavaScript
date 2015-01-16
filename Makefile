run:
	node js/cloudmine.js

unit:
	@echo "no unit tests yet"

# apps/keys are for applications named "cloudmine-integraton" in geoff's account
integration-aws:
	CLOUDMINE_APPID=4d2631c701a74e11a17197f5bcf506b5 \
	CLOUDMINE_APIKEY=a5126d647c32486e8ed525f859725df7 \
	CLOUDMINE_APIROOT=https://api.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

# apps/keys are for applications named "cloudmine-integraton" in geoff's account
integration-rackspace:
	CLOUDMINE_APPID=11d74d7cd2bd40e8813f7d4aba8a98b5 \
	CLOUDMINE_APIKEY=2532af65040d4090b6f561f5ba5db901 \
	CLOUDMINE_APIROOT=https://api.rs.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration:
	$(MAKE) integration-aws && $(MAKE) integration-rackspace

test:
	$(MAKE) unit
	$(MAKE) integration

kill-node:
	-kill `ps -eo pid,comm | awk '$$2 == "node" { print $$1 }'`

.PHONY: test unit run
