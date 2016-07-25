/*jslint  browser: true, devel: true,  vars: true, todo: true, white: true */
/*global  $,WebSocket,crypto,indexedDB,IDBKeyRange,Uint8Array,Promise,ArrayBuffer */
/* jshint strict: true, jquery: true */

var Fluffy;
Fluffy = Fluffy || {}; // setup namespace


Fluffy.TestIDP = (function () {
    "use strict";

     var publicExport = {
     };

    return publicExport;
}());   


var  idp = {};

//   Promise<RTCIdentityAssertionResult>  generateAssertion (DOMString contents, DOMString origin, optional DOMString usernameHint);
idp.generateAssertion = function( contents, origin, userNameHint ) {
    var p = new Promise(
        function( resolve, reject ) {
            var assertResult = {};
            var passport = {};
            passport.iat = "1443208345"
            passport.otn = "1215551212"
            passport.duri = "foo@example.org"
            passport.junk1 = userNameHint
            passport.junk2 = origin
            passport.mky = contents 
            assertResult.assertion =  JSON.stringify( passport );
            assertResult.idp = {};
            assertResult.idp.domain = origin;
            assertResult.idp.protocol = "passport-v1";
            resolve( assertResult );
        } );
    return p;
}

// Promise<RTCIdentityValidationResult> validateAssertion (DOMString assertion, DOMString origin);
idp.validateAssertion = function( assertion, origin ) {
     var p = new Promise(
         function( resolve, reject ) {
             var validationResult= {};
             validationResult.identity = "fluf@fluffy";
             validationResult.contents = "";
             resolve( validationResult );
         } );
    return p;
}

if ( typeof rtcIdentityProvider != 'undefined' ) {
    // console.log( "Foo" );
    rtcIdentityProvider.register( idp );
} else {
    console.log( "No rtcIdentityProvider defined" );
    var p1 = idp.generateAssertion( "foo", "my-origin", "nameHint" );
    p1.then( function( r ) {
        console.log( "Assertion is: " + JSON.stringify( r ) );

        var p2 = idp.validateAssertion( r , "my-origin" );
        p2.then( function( v ) {
            console.log( "Validation is: " + JSON.stringify( v ) );
        });
    });
}



