
# Play around with WebRTC Identity stuff

run with

make

./server

Install cert and key

add /etc/host for cert name to localhost


https://cert-name-here:10443/


# Notes


Martin has an example at http://martinthomson.github.io/.well-known/idp-proxy/idp.js


Note that the go server does nto mark files as no cache so idp.js gets cached way
more than you want.Reload of
https://ks.fluffy.im:10443/idp
will load the idp.js





