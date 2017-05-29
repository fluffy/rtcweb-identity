/*jslint  browser: true, devel: true,  vars: true, todo: true, white: true */
/*global  $,WebSocket,crypto,indexedDB,IDBKeyRange,Uint8Array,Promise,ArrayBuffer */
/* jshint strict: true, jquery: true */

var Fluffy;
Fluffy = Fluffy || {}; // setup namespace

Fluffy.TestIdentity = (function () {
    "use strict";

    var publicExport = {
    };

    return publicExport;
}());   


$(document).ready(function(){
    "use strict";

    $("#doPost").click(function(){
    });

    function logError(error) {
        console.log(error.name + ": " + error.message);
    }
    
    console.log( "starting 1" );
    var configuration = { "iceServers": [] };
    var pc = new window.RTCPeerConnection(configuration);

    /*
    console.log( "step 1a" );
    var keygenAlgorithm = { name: "RSASSA-PKCS1-v1_5",
                        modulusLength: 2048,
                        publicExponent: new Uint8Array([1, 0, 1]),
                        hash: "SHA-256" };
    // also { name: "ECDSA", namedCurve: "P-256" }
    
    RTCPeerConnection.generateCertificate( keygenAlgorithm ).then( function(cert) {
        //var f =  cert.getFingerprints();
        var s = JSON.stringify( { "new cert fingerprints": cert } )
        console.log( s );
    }).catch(logError);
    */
    
    console.log( "step 2" );
    var hint = { "otn": "14084219990", "duri": "sip:jon@example.org" };
    pc.setIdentityProvider("ks.fluffy.im:10443","passport-v1",JSON.stringify( hint ) );

    console.log( "step 2a" );
    pc.onicecandidate = function (evt) {
        if (evt.candidate) {
            //console.log(JSON.stringify({ "candidate": evt.candidate }));
        } else {
            //console.log("ICE done gathering");
            var sdp = JSON.stringify( pc.localDescription );
            console.log( "SDP = " + sdp.split("\\r\\n").join('\n   ') );
        }
    };

    console.log( "step 3" );
    
    pc.onnegotiationneeded = function () {
        pc.createOffer().then(function (offer) {
            return pc.setLocalDescription(offer);
        })
            .then(function () {
                // send the offer to the other peer
                //console.log( "INIT   " + JSON.stringify( pc.localDescription ));
            })
            .catch(logError);
    };
    
    console.log( "step 4" );
    
    var ch = pc.createDataChannel("myData");
    console.log( "created channel");
    
    console.log( "step 5" );
});



