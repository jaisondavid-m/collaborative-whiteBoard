package main

import (

	"time"
	
	"server/config"
	"server/jobs"
	"server/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	err := godotenv.Load()

	if err != nil {
		panic("Failed to load .env")
	}

	// config.ConnectDB()
	config.ConnectTiDB()

	r := gin.Default()
	r.Use(config.SetupCORS())

	routes.SetupRoutes(r)

	go func() {
		
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		jobs.CleanupInactiveGuests()

		for range ticker.C {
			jobs.CleanupInactiveGuests()
		}

	}()

	r.Run(":8000")

}
