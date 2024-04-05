package cmd

import (
	"fmt"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

var freqWords = &cobra.Command{
	Use:   "freq-words",
	Short: "List n least frequent words in the store",

	Run: func(cmd *cobra.Command, args []string) {

		var n = 10
		resp, err := http.Get(fmt.Sprintf("http://%v/freq-words/%v", url, n))

		if err != nil {
			log.Fatal(err)
		}

		defer resp.Body.Close()

		fmt.Println(resp.Status)
	},
}

func init() {
	rootCmd.AddCommand(freqWords)
}
