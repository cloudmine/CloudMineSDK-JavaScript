run:
	node js/cloudmine.js

unit:
	@echo "no unit tests yet"

# apps/keys for integration tests are from applications named
# "cloudmine-integraton" in geoff's account - see tests/README

integration-aws:
	CLOUDMINE_APPID=4d2631c701a74e11a17197f5bcf506b5 \
	CLOUDMINE_APIKEY=a5126d647c32486e8ed525f859725df7 \
	CLOUDMINE_APIROOT=https://api.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-rackspace:
	CLOUDMINE_APPID=11d74d7cd2bd40e8813f7d4aba8a98b5 \
	CLOUDMINE_APIKEY=2532af65040d4090b6f561f5ba5db901 \
	CLOUDMINE_APIROOT=https://api.rs.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-staging:
	CLOUDMINE_APPID=15a1317012c54c1fb33d17acb9aa6470 \
	CLOUDMINE_APIKEY=147f4e7ec075487abcc1b29132474ac3 \
	CLOUDMINE_APIROOT=http://api-staging.cloudmine.me \
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
