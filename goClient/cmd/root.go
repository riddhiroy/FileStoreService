package cmd

import (
	"github.com/spf13/cobra"
)

var url string

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "store",
	Short: "File store service to perfom plain-text files to an HTTP server",
	Long:  "This is a CLI that enables users to store, update, and delete files, and to perform operations on the files stored in the server",
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	cobra.CheckErr(rootCmd.Execute())
}

func init() {
	rootCmd.PersistentFlags().StringVarP(&url, "url", "u", "localhost:5000", "HTTP Server's url")
}
