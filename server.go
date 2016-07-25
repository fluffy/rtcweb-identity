package main

import (
	"net/http"
	"html/template"
	"log"
)

var templates = template.Must(template.ParseFiles( "idp.html", "client.html" ))

func mainHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	type PageData struct {
		Junk string
	}
	data := PageData{Junk: "data"}
	err := templates.ExecuteTemplate(w, "client.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func mainIdpHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/idp" {
		http.NotFound(w, r)
		return
	}

	type PageData struct {
		Junk string
	}
	data := PageData{Junk: "data"}
	err := templates.ExecuteTemplate(w, "idp.html", data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func idpHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/.well-known/idp-proxy/passport-v1" {
		http.NotFound(w, r)
		return
	}

	http.Redirect(w, r, "/scripts/idp.js", 302)
}


func main() {
	// set up the router
	
	http.HandleFunc("/", mainHandler)
	http.HandleFunc("/idp", mainIdpHandler)
	http.HandleFunc("/.well-known/idp-proxy/passport-v1", idpHandler)

	http.Handle("/scripts/", http.StripPrefix("/scripts/", http.FileServer(http.Dir("scripts"))))
	http.Handle("/bower_components/", http.StripPrefix("/bower_components/", http.FileServer(http.Dir("bower_components"))))

	//http.ListenAndServe(":8080", nil)

	err := http.ListenAndServeTLS(":10443", "cert.pem", "key.pem", nil)
	if err != nil {
		log.Fatal(err)
	}
}

