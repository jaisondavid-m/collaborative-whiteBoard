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
		room.GET("/list",handlers.ListRooms)
		room.POST("/check/:roomId",handlers.CheckRoomPassword)
	}

	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(),middleware.AdminMiddleware())
	{
		admin.GET("/users",handlers.ListUsers)
	}

	superadmin := r.Group("/superadmin")
	superadmin.Use(middleware.AuthMiddleware(),middleware.SuperAdminMiddleware())
	{
		superadmin.POST("/promote",handlers.UpdateRole)
	}

}