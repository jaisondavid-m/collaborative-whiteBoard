package handlers

import (

	"net/http"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"

)

type SendNotificationInput struct {
	Title 			string 			`json:"title" binding:"required"`
	Message 		string 			`json:"message" binding:"required"`
	Type 			string 			`json:"type"` //Info | Warning | alert
	Recipients 		[]string 		`json:"recipients"`
}

func SendNotification(c *gin.Context) {

	var input SendNotificationInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Invalid Input",
		})
		return
	}

	senderID, _ := c.Get("userid")
	notifType := input.Type
	if notifType == "" {
		notifType = "info"
	}

	if len(input.Recipients) == 0 {

		notif := models.Notification{
			Title: input.Title,
			Message: input.Message,
			SenderID: senderID.(string),
			RecipientID: "", //broadcast
			Type: notifType,
		}

		config.DB.Create(&notif)

		c.JSON(http.StatusOK, gin.H{
			"message": "Broadcast notification sent",
		})

		return
	}

	// Targeted: one row per recipient
	for _, uid := range input.Recipients {
		notif := models.Notification{
			Title: input.Title,
			Message: input.Message,
			SenderID: senderID.(string),
			RecipientID: uid,
			Type: notifType,
		}
		config.DB.Create(&notif)
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Notification sent",
		"count":len(input.Recipients),
	})
}

func GetMyNotifications(c *gin.Context) {

	userID, _ := c.Get("userid")

	var notifs []models.Notification

	config.DB.Where("recipient_id = ? OR recipient_id = ''",userID.(string)).
		Order("created_at desc").
		Limit(50).
		Find(&notifs)

	c.JSON(http.StatusOK, gin.H{
		"notifications":notifs,
	})

}

func MarkNotificationRead(c *gin.Context) {

	id := c.Param("id")

	userID, _ := c.Get("userid")

	config.DB.Model(&models.Notification{}).
		Where("id = ? AND (recipient_id = ? OR recipient_id = '')",id,userID.(string)).
		Update("is_read",true)

	c.JSON(http.StatusOK,gin.H{
		"message":"Marked as read",
	})

}


func MarkAllRead(c *gin.Context) {

	userID, _ := c.Get("userid")

	config.DB.Model(&models.Notification{}).
		Where("recipient_id = ? OR recipient_id = ''", userID.(string))

	c.JSON(http.StatusOK,gin.H{
		"message":"All marked as read",
	})

}

func UnreadCount(c *gin.Context) {

	userID, _ := c.Get("userid")

	var count int64

	config.DB.Model(&models.Notification{}).
		Where("(recipient_id = ? OR recipient_id = '') AND is_read = false",userID.(string)).
		Count(&count)

	c.JSON(http.StatusOK,gin.H{
		"count":count,
	})

}




