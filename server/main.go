package main

import (

	"server/config"
	"server/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

)

func main() {

	err := godotenv.Load()

	if err != nil {
		panic("Failed to load .env")
	}

	config.ConnectDB()

	r := gin.Default()
	r.Use(config.SetupCORS())

	routes.SetupRoutes(r)

	r.Run(":8000")

}