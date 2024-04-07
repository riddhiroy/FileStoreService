package cmd

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/spf13/cobra"
)

var freqWordsCmd = &cobra.Command{
	Use:   "freq-words",
	Short: "List n least frequent words in the store",

	Run: func(cmd *cobra.Command, args []string) {

		n, _ := cmd.Flags().GetString("limit")
		order, _ := cmd.Flags().GetString("order")
		resp, err := http.Get(fmt.Sprintf("http://%v/freq-words?limit=%v&order=%v", url, n, order))

		if err != nil {
			log.Fatal(err)
		}

		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatal(err)
		}

		if resp.StatusCode != 200 {

			responseString := string(body)
			fmt.Println(responseString)
			return
		}

		// Unmarshal the JSON array into a slice of strings
		var words []string
		err = json.Unmarshal(body, &words)
		if err != nil {
			log.Fatal(err)
		}

		// Print each element of the file name array
		for i, word := range words {
			fmt.Print(word + "\t")
			if (i+1)%5 == 0 && i != len(words)-1 {
				fmt.Println()
			} else if i == len(words)-1 {
				fmt.Println("")
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(freqWordsCmd)
	freqWordsCmd.PersistentFlags().String("limit", "10", "set the number of words to return")
	freqWordsCmd.PersistentFlags().String("order", "dsc", "set 'dsc' for most and 'asc' for least frequent words")
}
