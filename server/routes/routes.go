package routes

import (
	"server/handlers"
	"server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	auth := r.Group("/auth")
	{
		auth.POST("/register",handlers.Register)
		auth.POST("/login",handlers.Login)
	}

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile",handlers.Profile)
	}

	room := protected.Group("/room")
	{
		room.POST("/create",handlers.CreateRoom)
		room.GET("/join/:roomId",handlers.JoinRoom)
	}

}