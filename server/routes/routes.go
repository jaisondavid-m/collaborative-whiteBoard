package routes

import (
	"server/handlers"
	"server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	r.Use(middleware.AuditMiddleware())

	auth := r.Group("/auth")
	{
		auth.POST("/register",handlers.Register)
		auth.POST("/login",handlers.Login)
		auth.POST("/google",handlers.GoogleLogin)
	}

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile",handlers.Profile)
		protected.DELETE("/user",handlers.DeleteAccount)
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
		admin.DELETE("/users/:userId",handlers.DeleteUserByAdmin)
		admin.PUT("/users/:userId",handlers.RecoverUserByAdmin)
		admin.PUT("/users/:userId/unblock",handlers.UnblockUserByAdmin)
		admin.PUT("/users/:userId/block",handlers.BlockUserByAdmin)
		admin.GET("/audit-logs",handlers.ListAuditLogs)
		admin.GET("/audit-logs/stats",handlers.GetAuditStats)
	}

	superadmin := r.Group("/superadmin")
	superadmin.Use(middleware.AuthMiddleware(),middleware.SuperAdminMiddleware())
	{
		superadmin.POST("/promote",handlers.UpdateRole)
	}

}