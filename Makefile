
SRC  := $(wildcard draft-*.md)

HTML := $(patsubst %.md,%.html,$(SRC))
TXT  := $(patsubst %.md,%.txt,$(SRC))
DIF  := $(patsubst %.md,%.diff.html,$(SRC))
PDF  := $(patsubst %.md,%.pdf,$(SRC))

all:  $(HTML) $(TXT) server 

fetch:
	bower update


server: server.go
	go build server.go


lint:
	jshint scripts/idp.js
	jslint scripts/idp.js


clean:
	rm -rf *~ *# server bower_components draft*.html draft*pdf draft*txt


%.xml: %.md 
	mmark --bib-rfc "/Users/fluffy/bibxml/" --bib-id "/Users/fluffy/bibxml/" -page -xml2  $^ $@


%.html: %.xml
	xml2rfc $^ --html

%.txt: %.xml
	xml2rfc $^ --text 

%.diff.html: %.txt
	htmlwdiff  $^.old $^ >  $@

%.pdf: %.html  $(SVG)
	wkpdf -p letter -s $^ -o $@


%.pdf: %.html  $(SVG)
	wkpdf -p letter -s $^ -o $@

%.svg: %.wsd
	node ./ladder/ladder.js $^ $@

%.png: %.svg
	java -jar batik-rasterizer-1.8.jar $^ -d $@ -bg 255.255.255.255


test.key:
	openssl genrsa -out test.key 2048

test.csr: test.key openssl.cnf
	openssl req -new -out test.csr -key test.key -config openssl.cnf -batch 

test.cert: test.csr test.key openssl.cnf
	openssl x509 -req -days 3650 -in test.csr -signkey test.key -out test.cert -extfile openssl.cnf -extensions v3_req

test.cert.txt: test.cert
	openssl x509 -in test.cert -noout -text > test.cert.txt



