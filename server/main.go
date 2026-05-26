package main

import (

	"server/config"
	"server/routes"

	"github.com/gin-gonic/gin"

)

func main() {

	config.ConnectDB()

	r := gin.Default()

	routes.SetupRoutes(r)

	r.Run(":8000")

}