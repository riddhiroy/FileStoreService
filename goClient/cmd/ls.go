package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

var lsCmd = &cobra.Command{
	Use:   "ls",
	Short: "List files in the store",

	Run: func(cmd *cobra.Command, args []string) {

		resp, err := http.Get(fmt.Sprintf("http://%v/ls", url))
		if err != nil {
			log.Fatal(err)
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		// Unmarshal the JSON array into a slice of strings
		var filenames []string
		err = json.Unmarshal(body, &filenames)
		if err != nil {
			log.Fatal(err)
		}

		// Print each element of the file name array
		for i, filename := range filenames {
			fmt.Print(filename + " \t")
			if (i+1)%5 == 0 && i != len(filenames)-1 {
				fmt.Println()
			} else if i == len(filenames)-1 {
				fmt.Println("")
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(lsCmd)
}
