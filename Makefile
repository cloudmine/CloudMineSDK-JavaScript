testfiles := $(wildcard tests/snippets/*)
CLOUDMINE_APPID := ENOAPPID
CLOUDMINE_APIKEY := ENOAPIKEY
CLOUDMINE_MASTERKEY := ENOMASTERKEY
CLOUDMINE_APIROOT := https://api.cloudmine.io

run:
	node js/cloudmine.js

unit: aws-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	node_modules/mocha/bin/mocha ./tests/headers.js


# apps/keys for integration tests are from applications named
# "cloudmine-integraton" in geoff's account - see tests/README

integration-verizon: verizon-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-secure: secure-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-aws: aws-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-pentest: pentest-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-staging: staging-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration-eu: eu-env
	CLOUDMINE_APPID=$(CLOUDMINE_APPID) \
	CLOUDMINE_APIKEY=$(CLOUDMINE_APIKEY) \
	CLOUDMINE_APIROOT=$(CLOUDMINE_APIROOT) \
	./node_modules/qunit/bin/cli.js -d ./tests/init.js ./tests/util.js ./tests/config.js \
	-c ./js/cloudmine.js \
	-t ./tests/tests.js   

integration:
	$(MAKE) integration-aws

test:
	$(MAKE) unit
	$(MAKE) integration

lint:
	./node_modules/jslint/bin/jslint.js --maxerr=1000 --passfail=false 'js/cloudmine.js'

kill-node:
	-kill `ps -eo pid,comm | awk '$$2 == "node" { print $$1 }'`

staging-env:
	$(eval CLOUDMINE_APPID := 9249ede3e7874c89ac0b6b775cdf9642)
	$(eval CLOUDMINE_APIKEY := 4265b75da6a54102a4e9436cf24c95e0)
	$(eval CLOUDMINE_MASTERKEY := 4265b75da6a54102a4e9436cf24c95e0)
	$(eval CLOUDMINE_APIROOT := https://api.staging.cloudmine.me)

pentest-env:
	$(eval CLOUDMINE_APPID := 1fa68ef4142f415e972bc610ff434f21)
	$(eval CLOUDMINE_APIKEY := f1bc06386f4143afa58597f7635091e8)
	$(eval CLOUDMINE_MASTERKEY := 90F940B263454CAF8AE94382C5C6B253)
	$(eval CLOUDMINE_APIROOT := https://api.pentest.cloudmine.me)

aws-env:
	$(eval CLOUDMINE_APPID := 4d2631c701a74e11a17197f5bcf506b5)
	$(eval CLOUDMINE_APIKEY := a5126d647c32486e8ed525f859725df7)
	$(eval CLOUDMINE_MASTERKEY := 20DF680D234C441B9869A21B8FEB6523)
	$(eval CLOUDMINE_APIROOT := https://api.cloudmine.io)

secure-env:
	$(eval CLOUDMINE_APPID := 94aec595a8d142a78da057a9a5b5f354)
	$(eval CLOUDMINE_APIKEY := a31309107b2e431b9d6e1f1e12b73adb)
	$(eval CLOUDMINE_MASTERKEY := C7A6A3B9DB1649BFA059EF6C07FA09AB)
	$(eval CLOUDMINE_APIROOT := https://api.secure.cloudmine.me)

verizon-env:
	$(eval CLOUDMINE_APPID := a701e4ef8d454b158366b233c69e3e70)
	$(eval CLOUDMINE_APIKEY := 44512e2760e44e67826ab4e7f7113efc)
	$(eval CLOUDMINE_MASTERKEY := ENOMASTERKEY)
	$(eval CLOUDMINE_APIROOT := http://204.151.47.194)

eu-env:
	$(eval CLOUDMINE_APPID := 47befa9b735c614dfd0867c70a7f85c3)
	$(eval CLOUDMINE_APIKEY := 2757ea7d06a042ae99c62a5ce0a8caf3)
	$(eval CLOUDMINE_MASTERKEY := D600718EBB6B4274865F517B9428C298)
	$(eval CLOUDMINE_APIROOT := https://api.eu01.cloudmine.me)

aws-setup: aws-env
	$(foreach file, $(testfiles), curl -i -X POST -H "X-CloudMine-ApiKey: $(CLOUDMINE_MASTERKEY)" -H "Content-Type: application/x-www-form-urlencoded" $(CLOUDMINE_APIROOT)/admin/app/$(CLOUDMINE_APPID)/code --data-binary "name=$(shell basename $(file))&code=$(shell cat $(file) | sed -e 's!APPID!$(CLOUDMINE_APPID)!g;s!APIKEY!$(CLOUDMINE_APIKEY)!g;s!APIROOT!$(CLOUDMINE_APIROOT)!g;' | python -c 'import sys, urllib; print urllib.quote(sys.stdin.read())')";)

secure-setup: secure-env
	$(foreach file, $(testfiles), curl -i -X POST -H "X-CloudMine-ApiKey: $(CLOUDMINE_MASTERKEY)" -H "Content-Type: application/x-www-form-urlencoded" $(CLOUDMINE_APIROOT)/admin/app/$(CLOUDMINE_APPID)/code --data-binary "name=$(shell basename $(file))&code=$(shell cat $(file) | sed -e 's!APPID!$(CLOUDMINE_APPID)!g;s!APIKEY!$(CLOUDMINE_APIKEY)!g;s!APIROOT!$(CLOUDMINE_APIROOT)!g;' | python -c 'import sys, urllib; print urllib.quote(sys.stdin.read())')";)

staging-setup: staging-env
	$(foreach file, $(testfiles), curl -i -X POST -H "X-CloudMine-ApiKey: $(CLOUDMINE_MASTERKEY)" -H "Content-Type: application/x-www-form-urlencoded" $(CLOUDMINE_APIROOT)/admin/app/$(CLOUDMINE_APPID)/code --data-binary "name=$(shell basename $(file))&code=$(shell cat $(file) | sed -e 's!APPID!$(CLOUDMINE_APPID)!g;s!APIKEY!$(CLOUDMINE_APIKEY)!g;s!APIROOT!$(CLOUDMINE_APIROOT)!g;' | python -c 'import sys, urllib; print urllib.quote(sys.stdin.read())')";)

pentest-setup: pentest-env
	$(foreach file, $(testfiles), curl -i -v -X POST -H "X-CloudMine-ApiKey: $(CLOUDMINE_MASTERKEY)" -H "Content-Type: application/x-www-form-urlencoded" $(CLOUDMINE_APIROOT)/admin/app/$(CLOUDMINE_APPID)/code --data-binary "name=$(shell basename $(file))&code=$(shell cat $(file) | sed -e 's!APPID!$(CLOUDMINE_APPID)!g;s!APIKEY!$(CLOUDMINE_APIKEY)!g;s!APIROOT!$(CLOUDMINE_APIROOT)!g;' | python -c 'import sys, urllib; print urllib.quote(sys.stdin.read())')";)

eu-setup: eu-env
	$(foreach file, $(testfiles), curl -i -v -X POST -H "X-CloudMine-ApiKey: $(CLOUDMINE_MASTERKEY)" -H "Content-Type: application/x-www-form-urlencoded" $(CLOUDMINE_APIROOT)/admin/app/$(CLOUDMINE_APPID)/code --data-binary "name=$(shell basename $(file))&code=$(shell cat $(file) | sed -e 's!APPID!$(CLOUDMINE_APPID)!g;s!APIKEY!$(CLOUDMINE_APIKEY)!g;s!APIROOT!$(CLOUDMINE_APIROOT)!g;' | python -c 'import sys, urllib; print urllib.quote(sys.stdin.read())')";)

.PHONY: test unit run
