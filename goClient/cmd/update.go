package cmd

import (
	"bytes"
	"fmt"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

// updateCmd represents the update command
var updateCmd = &cobra.Command{
	Use:   "update",
	Short: "update contents of specified stored file, or create file if not already stored",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			log.Fatal("Pass a valid file name.")
		}

		request := FileUploadHandler(fmt.Sprintf("http://%v/update", url), "file", "PUT", args)

		client := &http.Client{}

		for _, req := range request {
			resp, err := client.Do(req)
			if err != nil {
				log.Fatal(err)
			} else {
				body := &bytes.Buffer{}
				_, err := body.ReadFrom(resp.Body)
				if err != nil {
					log.Fatal(err)
				}

				resp.Body.Close()

				fmt.Println(body)
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(updateCmd)
}
