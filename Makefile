run:
	node js/cloudmine.js

unit:
	CLOUDMINE_APPID=a701e4ef8d454b158366b233c69e3e70 \
	CLOUDMINE_APIKEY=44512e2760e44e67826ab4e7f7113efc \
	CLOUDMINE_APIROOT=https://api.cloudmine.me \
	node_modules/mocha/bin/mocha ./tests/headers.js


# apps/keys for integration tests are from applications named
# "cloudmine-integraton" in geoff's account - see tests/README

integration-verizon:
	CLOUDMINE_APPID=a701e4ef8d454b158366b233c69e3e70 \
	CLOUDMINE_APIKEY=44512e2760e44e67826ab4e7f7113efc \
	CLOUDMINE_APIROOT=http://204.151.47.194 \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-secure:
	CLOUDMINE_APPID=94aec595a8d142a78da057a9a5b5f354 \
	CLOUDMINE_APIKEY=a31309107b2e431b9d6e1f1e12b73adb \
	CLOUDMINE_APIROOT=https://api.secure.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-aws:
	CLOUDMINE_APPID=4d2631c701a74e11a17197f5bcf506b5 \
	CLOUDMINE_APIKEY=a5126d647c32486e8ed525f859725df7 \
	CLOUDMINE_APIROOT=https://api.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-rackspace:
	CLOUDMINE_APPID=7bf87751c85e4e03bb5553fa6388dab3 \
	CLOUDMINE_APIKEY=427fde0286a24377b31541bf4facf67a \
	CLOUDMINE_APIROOT=https://api.rs.cloudmine.me \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-staging:
	CLOUDMINE_APPID=9249ede3e7874c89ac0b6b775cdf9642 \
	CLOUDMINE_APIKEY=4265b75da6a54102a4e9436cf24c95e0 \
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
