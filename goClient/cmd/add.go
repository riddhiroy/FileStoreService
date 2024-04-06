package cmd

import (
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

// addCmd represents the add command
var addCmd = &cobra.Command{
	Use:   "add",
	Short: "Add file to server",
	Run: func(cmd *cobra.Command, args []string) {

		if len(args) == 0 {
			log.Fatal("Pass a valid file name.")
		}

		request := FileUploadHandler(fmt.Sprintf("http://%v/add", url), "file", "POST", args)

		client := &http.Client{}

		for i, req := range request {
			resp, err := client.Do(req)
			if err != nil {
				log.Fatal(err)
			} else {
				if resp.StatusCode == 500 {
					fmt.Printf("Error: File %v already exists in store\n", args[i])
				} else {
					body, err := io.ReadAll(resp.Body)
					if err != nil {
						log.Fatal(err)
					}

					responseString := string(body)
					fmt.Println(responseString)
				}
				resp.Body.Close()
			}
		}

	},
}

func init() {
	rootCmd.AddCommand(addCmd)
}
