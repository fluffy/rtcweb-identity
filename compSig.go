
package main

import (
	"fmt"
	"crypto"
	"crypto/rsa"
//	"crypto/ecdsa"
	"crypto/rand"
	"crypto/sha256"
//	"math/big"
	"encoding/base64"
//	"strings"
	"crypto/x509"
	"encoding/pem"
	"io/ioutil"
)


func main() {
    rng := rand.Reader

	privKeyFilename := "test.key"

	privKeyPEM, err := ioutil.ReadFile(privKeyFilename)
	if err != nil {
		fmt.Printf("Can't load private key",err)
		return
	}

	decodedPEM, _ := pem.Decode(privKeyPEM)

	rsaPrivateKey, err := x509.ParsePKCS1PrivateKey(decodedPEM.Bytes)
	if err  != nil{
		fmt.Printf("Can't parse private key",err)
		return
	}
	
    message := []byte("Test Message")

    hashed := sha256.Sum256(message)

    signature, err := rsa.SignPKCS1v15(rng, rsaPrivateKey, crypto.SHA256, hashed[:])
    if err != nil {
            fmt.Printf( "Error from signing:", err)
            return
    }

	fmt.Print("Signature: ", base64.URLEncoding.EncodeToString(signature) )
}
