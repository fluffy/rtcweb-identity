%%%

    #
    # Using WebRTC Identity with STIR
    #
    # Generation tool chain:
    #   mmark (https://github.com/miekg/mmark)
    #   xml2rfc (http://xml2rfc.ietf.org/)
    #

    Title = "Using WebRTC Identity with STIR"
    abbrev = "WebRTC and STIR Identity"
    category = "info"
    docName = "draft-jennings-stir-rtcweb-identity-00"
    ipr= "trust200902"
    area = "ART"
    keyword = ["STIR", "WebRTC", "SIP","Identity"]
    
    [pi]
    symrefs = "yes"
    sortrefs = "yes"

    [[author]]
    initials = "C."
    surname = "Jennings"
    fullname = "Cullen Jennings"
    organization = "Cisco Systems"
      [author.address]
      email = "fluffy@iii.ca"

%%%

.# Abstract

This draft outlines the approach to use STIR Passport tokens as the Identity
assertions in WebRTC. It outlines some proposed changes to improve identity
interoperability for different calling systems.

This is a very rough first draft purely to have something to discuss. 

{mainmatter}

# Introduction

This draft is purely to help track the discussion about WebRTC and STIR identity
and provide a place to send pull requests. It is not meant to become an RFC -
the relevant information will flow into other specifications once we come to
some consensus on what needs to be done.

It assumes the reader if familiar with [@!I-D.ietf-rtcweb-security-arch],
[@!I-D.ietf-stir-certificates], [@!I-D.ietf-stir-passport], and
[@!I-D.ietf-stir-rfc4474bis].


# Information Flow

This section steps through the logical information flow to use STIR Identity in
WebRTC based on what we have in the specifications today. Later sections propose
some changes to current specifications.

## Actors

Cullen, with a phone number of +1 408 555 1212 is using skype.com to call Jon at
"sip:jon@example.org". Both people use a WebRTC softphone. Cullen uses an identity
provider of att.com. Skype could be the identity provider for this use case but
it's easier to understand the flow if you look at it as a separate provider.

Before the call ever starts, Cullen's browser fetches the webpage from skype.com
and logs on to that website. Cullen then goes to call Jon. The skype JS notes
that the Cullen's identity provider is att.com and the JavaScript for the skype
web page does a

```
pc.setIdentityProvider("att.com","passport",
                      JSON.stringify( {"otn": "14085551212",
                                    "duri": "sip:jon@example.org"}));
```

And start the setup of media to the other side which will eventually generate an
SDP offer. The browser will load the IDP JS from IdP at

```
https://att.com/.well-known/idp-proxy/passport
```

(see section 5.6.5 of  [@!I-D.ietf-rtcweb-security-arch])

The browser will then call the IDP javascript code to generate a WebRTC identity
assertion. It will pass to the generating function the hint information provided
in the setIdentityProvider of

```
{ "otn": "14084219990",
   "duri": "sip:jon@example.org" }
```

The browser also passes the DTLS fingerprints and hash algorithm used to
generate them to the JS for the IdP in an array like


```
[ 
   { 
      "algorithm":"sha-256",
      "digest":"23:E8:6E:28:3F:D1:CF:17:DE:88:0F:EE:5A:AB:
          AD:03:2D:77:FB:05:17:BA:61:12:1B:37:D4:19:4F:38:DF:EC"
   }
]
```
   
All of this information can be sent to the idp.com along with the whatever login
flow att.com wants to use to have Cullen authenticated to att.com

At this point, the IdP has all the information to create the Passport Token.

The DTLS-SRTP fingerprints are reformatted to be in the form

```
"mky": "sha-256 23:E8:6E:28:3F:D1:CF:17:DE:88:0F:EE:5A:AB:
              AD:03:2D:77:FB:05:17:BA:61:12:1B:37:D4:19:4F:38:DF:EC"
```

The passport header is set to 

```
{
   "typ":"passport",
   "alg":"RS256",
   "x5u":"https://cert.att.org/passport.crt"
}
```
                           
The current time is used for the iat field and a passport payload is formed. Note the payload
also gets called the claims. For example, the payload could look like

```
{ 
   "iat":"14443208345",
   "otn":"14084219990",
   "duri":"sip:jon@example.org",
   "mky":"sha-256 23:E8:6E:28:3F:D1:CF:17:DE:88:0F:EE:5A:AB:
              AD:03:2D:77:FB:05:17:BA:61:12:1B:37:D4:19:4F:38:DF:EC"
}
```

This is canonicalized and signed with a certificate valid to sign 14084219990. The
URL to fetch the certificate is found in the x5u field of the Passport Header.

The canonical headers base64 is

```
eyJ0eXAiOiJwYXNzcG9ydCIsImFsZyI6IlJTMjU2IiwieDV1IjoiaHR0cHM6Ly9jZXJ0
LmV4YW1wbGUub3JnL3Bhc3Nwb3J0LmNydCJ9
```

The canonical payload in base64 is

```
eyJpYXQiOiIxNDQ0MzIwODM0NSIsIm90biI6IjE0MDg0MjE5OTkwIiwiZHVyaSI6InNp
cDpqb25AZXhhbXBsZS5vcmciLCJta3kiOiJzaGEtMjU2IDIzOkU4OjZFOjI4OjNGOkQx
OkNGOjE3OkRFOjg4OjBGOkVFOjVBOkFCOkFEOjAzOjJEOjc3OkZCOjA1OjE3OkJBOjYx
OjEyOjFCOjM3OkQ0OjE5OjRGOjM4OkRGOkVDIn0
```

The base64 headers and payload are concatenated with a period between them and
the SHA 256 of the result is computed which, represented in hex, is

```
20ac9439ae10df640b39e177d4ec432fe590b2d95f4075957816b5929ca1acb0
```

This is signed using RSASSA-PKCS1-v1_5 to get a base64 encoded signature of

```
FMgDzm0ZLV3w-6yOSCm3ZorSwEednS38XtF2u29NhRQ5zh8Swh0uSGHASXFwUIQ7DXvG
4pKD1rbBLFYT3_ReDn6OJ36k0S3oNvwMD0FyrRYeji-pAjoh76Q-jsfJsOq-Pi35Fba8
ZYRvG_EgLE0FYXuM2nWm85RUKVSnkx5MBpOxuUxRyTZYJpaQjElVpv9MJKfd_HyuF66q
98tcqeDb8dlrjtPNnQQfOf6AyLTlRwJ64t7iTouGD_R85Lv4Hu4mwu2ZiOL_1jo5svoY
-KegM1KJh-M_ux4J52NoVeeLLgKg585qUHLrln6aEjevNQLBUcbdf_DKZ1hyj0oFR9lx
rw
```

The above example was done with and RSA key size of 2048 bits.

The headers, payload, and signature are concatenated with pereidos between then
to  form a Passport Token of the form (but with no line breaks)

```
eyJ0eXAiOiJwYXNzcG9ydCIsImFsZyI6IlJTMjU2IiwieDV1IjoiaHR0cHM6Ly9jZXJ0
LmV4YW1wbGUub3JnL3Bhc3Nwb3J0LmNydCJ9.
eyJpYXQiOiIxNDQ0MzIwODM0NSIsIm90biI6IjE0MDg0MjE5OTkwIiwiZHVyaSI6InNp
cDpqb25AZXhhbXBsZS5vcmciLCJta3kiOiJzaGEtMjU2IDIzOkU4OjZFOjI4OjNGOkQx
OkNGOjE3OkRFOjg4OjBGOkVFOjVBOkFCOkFEOjAzOjJEOjc3OkZCOjA1OjE3OkJBOjYx
OjEyOjFCOjM3OkQ0OjE5OjRGOjM4OkRGOkVDIn0.
FMgDzm0ZLV3w-6yOSCm3ZorSwEednS38XtF2u29NhRQ5zh8Swh0uSGHASXFwUIQ7DXvG
4pKD1rbBLFYT3_ReDn6OJ36k0S3oNvwMD0FyrRYeji-pAjoh76Q-jsfJsOq-Pi35Fba8
ZYRvG_EgLE0FYXuM2nWm85RUKVSnkx5MBpOxuUxRyTZYJpaQjElVpv9MJKfd_HyuF66q
98tcqeDb8dlrjtPNnQQfOf6AyLTlRwJ64t7iTouGD_R85Lv4Hu4mwu2ZiOL_1jo5svoY
-KegM1KJh-M_ux4J52NoVeeLLgKg585qUHLrln6aEjevNQLBUcbdf_DKZ1hyj0oFR9lx
rw
```


The IdP returns this to the IdP JS in the browser which forms an object like

```
{  
"assertion":
"eyJ0eXAiOiJwYXNzcG9ydCIsImFsZyI6IlJTMjU2IiwieDV1IjoiaHR0cHM6Ly9jZXJ0
LmV4YW1wbGUub3JnL3Bhc3Nwb3J0LmNydCJ9.
eyJpYXQiOiIxNDQ0MzIwODM0NSIsIm90biI6IjE0MDg0MjE5OTkwIiwiZHVyaSI6InNp
cDpqb25AZXhhbXBsZS5vcmciLCJta3kiOiJzaGEtMjU2IDIzOkU4OjZFOjI4OjNGOkQx
OkNGOjE3OkRFOjg4OjBGOkVFOjVBOkFCOkFEOjAzOjJEOjc3OkZCOjA1OjE3OkJBOjYx
OjEyOjFCOjM3OkQ0OjE5OjRGOjM4OkRGOkVDIn0.
FMgDzm0ZLV3w-6yOSCm3ZorSwEednS38XtF2u29NhRQ5zh8Swh0uSGHASXFwUIQ7DXvG
4pKD1rbBLFYT3_ReDn6OJ36k0S3oNvwMD0FyrRYeji-pAjoh76Q-jsfJsOq-Pi35Fba8
ZYRvG_EgLE0FYXuM2nWm85RUKVSnkx5MBpOxuUxRyTZYJpaQjElVpv9MJKfd_HyuF66q
98tcqeDb8dlrjtPNnQQfOf6AyLTlRwJ64t7iTouGD_R85Lv4Hu4mwu2ZiOL_1jo5svoY
-KegM1KJh-M_ux4J52NoVeeLLgKg585qUHLrln6aEjevNQLBUcbdf_DKZ1hyj0oFR9lx
rw",
   "idp":{  
      "domain":"https://ks.fluffy.im:10443",
      "protocol":"passport"
   }
}
```
   
This object is passed back into the browser user agent which base 64 encodes
adds it to the SDP in an header like

```
a=identity:eyJhc3NlcnRpb24iOiJleUowZVhBaU9pSndZWE56Y0c5eWRDSXNJbUZzW
nlJNklsSlRNalUySWl3aWVEVjFJam9pYUhSMGNITTZMeTlqWlhKMExtVjRZVzF3YkdVd
WIzSm5MM0JoYzNOd2IzSjBMbU55ZENKOS5leUpwWVhRaU9pSXhORFEwTXpJd09ETTBOU
0lzSW05MGJpSTZJakUwTURnME1qRTVPVGt3SWl3aVpIVnlhU0k2SW5OcGNEcHFiMjVBW
lhoaGJYQnNaUzV2Y21jaUxDSnRhM2tpT2lKemFHRXRNalUySURJek9rVTRPalpGT2pJN
E9qTkdPa1F4T2tOR09qRTNPa1JGT2pnNE9qQkdPa1ZGT2pWQk9rRkNPa0ZFT2pBek9qS
kVPamMzT2taQ09qQTFPakUzT2tKQk9qWXhPakV5T2pGQ09qTTNPa1EwT2pFNU9qUkdPa
k00T2tSR09rVkRJbjAuRk1nRHptMFpMVjN3LTZ5T1NDbTNab3JTd0VlZG5TMzhYdEYyd
TI5TmhSUTV6aDhTd2gwdVNHSEFTWEZ3VUlRN0RYdkcNCjRwS0QxcmJCTEZZVDNfUmVEb
jZPSjM2azBTM29OdndNRDBGeXJSWWVqaS1wQWpvaDc2US1qc2ZKc09xLVBpMzVGYmE4W
llSdkdfRWdMRTBGWVh1TTJuV204NVJVS1ZTbmt4NU1CcE94dVV4UnlUWllKcGFRakVsV
nB2OU1KS2ZkX0h5dUY2NnE5OHRjcWVEYjhkbHJqdFBOblFRZk9mNkF5TFRsUndKNjR0N
2lUb3VHRF9SODVMdjRIdTRtd3UyWmlPTF8xam81c3ZvWVxLZWdNMUtKaE1fdXg0SjUyT
m9WZWVMTGdLZzU4NXFVSExybG42YUVqZXZOUUxCVWNiZGZfREtaMWh5ajBvRlI5bHhyd
yIsImlkcCI6eyJkb21haW4iOiJodHRwczovL2tzLmZsdWZmeS5pbToxMDQ0MyIsInByb
3RvY29sIjoicGFzc3BvcnQifX0=
```

Which adds about 1K bytes to the SIP message.


## Mapping to SIP

A RTCWeb to SIP Gateway can take this assertion, decode it, and extract the
Passport Token out of it. It could then insert that into the SIP Invite. It
would need to cache the domain and protocol for this flow. Later when a reply
came back it, it could take the Passport token in the Identity and create a new
assertion using the cached domain and protocol and insert that. This is really
gross and we need to figure out a way where the SDP from SIP is the same as the
SDP from WebRTC when using the same passport token.


# Proposed Changes

## Remove Identity Hint Hack

Passing

```
JSON.stringify({"otn":"14084219990",
              "duri":"sip:jon@example.org"})
```

is sort of a hack. It would be better to pass "14084219990" as the identity hint and have
the API support an optional destination hint where we pass "sip:jon@example.org"


## Fingerprint format. 

Unify the format of the fingerprints between STIR and WebRTC. 

Proposal move to something more like

```
{
  "alg":"HS256",
  "digest":"23:E8:6E:28:3F:D1:CF:17:DE:88:0F:EE:5A:AB:
          AD:03:2D:77:FB:05:17:BA:61:12:1B:37:D4:19:4F:38:DF:EC"
}
```

And perhaps choose a more compact for the digest value - preferably base 64. 


## Format of identity header

### Token type in Identity header to allow multiple identity headers 

Have the type of identity token in a standard form outside the actual token so 
that things that don't understand the token still know what it is 

So the Identity line would change from something like 

```
a=identity:eyJhc3NlNzcG9ydHYxIn19;info=URL 
```

to 

```
a=identity:eyJhc3NlNzcG9ydHYxIn19;info=URL;type=passport 
```

### WebRTC support multiple tokens 

Nice to allow multiple IdP that produce different token types for a given offer 
in WebRTC. 

If the SDP had multiple tokens of different types, do we need WebRTC to be able 
to support this. 


### Abstract the identity and protocol in the WebRTC assertion

Currently the WebRTC token has to have the domain and protocol in a well defined
location in the assertion. But when this is represented into SDP, it might be
better to have it as optional tags on the Identity line instead of in the actual
token. So the Identity line would change from something like

```
a=identity:eyJhc3NlNzcG9ydHYxIn19
```

to

```
a=identity:eyJhc3NlNzcG9ydHYxIn19;
        domain=https://ks.fluffy.im:10443;protocol=passport
```

This would allow systems using passport identity to have the same SDP regardless
of it the SDP was for WebRTC or SIP

This would also  Passport Tokens generated in SIP to work for WebRTC


<!--
## Size of Everything

Assuming we are ok with 128 bit grade crypto, could we make all of this
significantly smaller. Many existing SIP systems for PSTN calls are using UDP
because of the way they do High Availability and quick detection of failed
nodes. Size of the UDP could be an issue.

No proposal here but might be worth thinking about a bit. 
-->

## Future Proofing

WebRTC allows future things to be added to the contents object passed to the IdP
JS. They have to be conveyed to the far side (see section 5.6.4 of
[@!I-D.ietf-rtcweb-security-arch]).

Proposal. Copy them into the claims in the passport token. 

## TEL URI

For single phone numbers, we already have a way to encode that in certificates
using the SAN with a URI containing a tel URI.

Proposal. Allow existing cert to be valid STIR certificates. 


## RFC822 Names

Consider an WebRTC endpoint that initiates a call using WebRTC that is then
translated to SIP then translated to XMPP to deliver it to the far end
user. Using a name like "sip:fluffy@example.com" is pretty weird at the WebRTC
and XMPP end. It might be better to use 822 style names instead of URIs.

If this was done, it would likely need to use the work that extends the current
X509 specifications to allow i18n names. (For example see [@I-D.lbaudoin-iemax]
)


## Encoding

We start with a fingerprint in binary and encoding it like "AA:BB:CC" resulting
in an expansion of 3 times. It then expands 1.3 times in the base64 encoding of
the payload when then expands 1.3 times in the base64 encoding of the identity
header making it over 5 times larger than the original. 


## WebRTC Canonical Form 

Ensure the definition of what goes in the WebRTC assertion content array is well
specified. Ensure it does not need to be bitwise exact but only the same when
compared at JS object level.

## Multi party

For a conference call or group MMS, we need to allow multiple destinations.

Proposal: making the duri a list.



<!--

## PERC Conference calls

To bind the passport to the SRTP media in a given call, nice to be able to
optionally include the list of SSRCs a users is using in the passport. At this
point the Passport for the conference has all the information to generate a
secure roster for the conference.

-->


# Acknowledgments

Thank you to Russ Housley for comments.


{backmatter}

# Example Cert 

The cert used to generat the examples is:

<{{test.cert}}

which contains

<{{test.cert.txt}}

# Example Private Key

The private key for the cert is:

<{{test.key}}

