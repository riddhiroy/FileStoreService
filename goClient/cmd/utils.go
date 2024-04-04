package cmd

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

func FileUploadHandler(uri, key, method string, args []string) []*http.Request {

	result := []*http.Request{}
	for _, f := range args {

		// open file
		//stores a pointer to the os.file in variable file.
		//The os.File type represents an open file descriptor and provides methods for reading and writing to the file

		file, err := os.Open(f)
		if err != nil {
			fmt.Printf("!!! %s !!!\n\n", err)
			continue
		}

		defer file.Close()

		// create a buffer
		body := &bytes.Buffer{}
		writer := multipart.NewWriter(body) // a multipart.Writer is created to construct a multipart request body.

		part, err := writer.CreateFormFile(key, filepath.Base(fmt.Sprintf("%v", f)))
		if err != nil {
			log.Fatal(err)
			return result
		}

		// copy the file content to buffer
		_, err = io.Copy(part, file)
		if err != nil {
			log.Fatal(err)
		}
		err = writer.Close()
		if err != nil {
			log.Fatal(err)
			return result
		}

		req, err := http.NewRequest(method, uri, body)
		req.Header.Set("Content-Type", writer.FormDataContentType())
		if err != nil {
			log.Fatal(err)
			return result
		} else {
			result = append(result, req)
		}
	}

	return result
}
