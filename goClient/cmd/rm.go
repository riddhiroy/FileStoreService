package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

var rmCmd = &cobra.Command{
	Use:   "rm",
	Short: "Remove the specified file",
	Run: func(cmd *cobra.Command, args []string) {
		if len(args) == 0 {
			log.Fatal("Pass a file name to delete")
		}

		//Building Request Body
		requestData := struct {
			Name string `json:"name"`
		}{
			Name: args[0],
		}

		// Marshal the struct into JSON
		requestBody, err := json.Marshal(requestData)
		if err != nil {
			fmt.Println("Error marshaling JSON:", err)
			return
		}

		client := &http.Client{}
		req, err := http.NewRequest("DELETE", fmt.Sprintf("http://%v/rm", url), bytes.NewBuffer(requestBody))

		req.Header.Set("Content-Type", "application/json")
		if err != nil {
			fmt.Println(err)
			return
		}

		// Fetch Request
		resp, err := client.Do(req)
		if err != nil {
			fmt.Println(err)
			return
		}
		defer resp.Body.Close()

		// Read Response Body

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			fmt.Println(err)
			return
		}

		fmt.Println(string(respBody))
	},
}

func init() {
	rootCmd.AddCommand(rmCmd)
}
