package routes

import (
	"server/handlers"
	"server/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {

	r.Use(middleware.AuditMiddleware())

	auth := r.Group("/auth")
	auth.Use(middleware.RateLimit(middleware.AuthLimit))
	{
		auth.POST("/register",handlers.Register)
		auth.POST("/login",handlers.Login)
		auth.POST("/google",handlers.GoogleLogin)
	}

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	protected.Use(middleware.RateLimit(middleware.DefaultLimit))
	{
		protected.GET("/profile",handlers.Profile)
		protected.DELETE("/user",handlers.DeleteAccount)
		protected.GET("/notifications",handlers.GetMyNotifications)
		protected.GET("/notifications/unread-count",handlers.UnreadCount)
		protected.PUT("/notifications/:id/read",handlers.MarkNotificationRead)
		protected.PUT("/notifications/read-all",handlers.MarkAllRead)

		// --- Private Messaging ---
		msg := protected.Group("/messages")
		{
			msg.POST("/send",handlers.SendMessage)
			msg.GET("/conversations",handlers.GetConversations) // inbox list
			msg.GET("/:userId", handlers.GetConversation)
			msg.DELETE("/:messageId", handlers.DeleteMessage)
			msg.PUT("/:messageId/read",handlers.MarkMessageRead)
			msg.GET("/unread-count",handlers.UnreadMessageCount)
		}
	}

	ws := r.Group("/ws")
	ws.Use(middleware.AuthMiddleware())
	{
		ws.GET("/private",handlers.PrivateChatWS)
	}

	room := protected.Group("/room")
	{
		room.POST("/create",handlers.CreateRoom)
		room.GET("/join/:roomId",handlers.JoinRoom)
		room.GET("/list",handlers.ListRooms)
		room.POST("/check/:roomId",handlers.CheckRoomPassword)
	}

	admin := r.Group("/admin")
	admin.Use(
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
		middleware.RateLimit(middleware.DefaultLimit),
	)
	{
		admin.GET("/users",handlers.ListUsers)
		admin.DELETE("/users/:userId",handlers.DeleteUserByAdmin)
		admin.PUT("/users/:userId",handlers.RecoverUserByAdmin)
		admin.PUT("/users/:userId/unblock",handlers.UnblockUserByAdmin)
		admin.PUT("/users/:userId/block",handlers.BlockUserByAdmin)
		admin.GET("/audit-logs",handlers.ListAuditLogs)
		admin.GET("/audit-logs/stats",handlers.GetAuditStats)
		admin.POST("/notifications/send",handlers.SendNotification)
	}

	superadmin := r.Group("/superadmin")
	superadmin.Use(
		middleware.AuthMiddleware(),
		middleware.SuperAdminMiddleware(),
		middleware.RateLimit(middleware.DefaultLimit),
	)
	{
		superadmin.POST("/promote",handlers.UpdateRole)
	}

}