package handlers

import (
	"net/http"

	"server/config"
	"server/models"
	"server/privatechat"

	"github.com/gin-gonic/gin"
)

func SendMessage(c *gin.Context) {

	senderID := c.GetString("userid")

	var input models.SendMessageInput 

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Invalid input",
		})
		return
	}

	if input.MessageType == "" {
		input.MessageType = "text"
	}

	var receiver models.User

	if err := config.DB.Where("user_id = ? AND is_deleted = ? AND is_blocked= ?", input.ReceiverID, false, false).First(&receiver).Error;

	err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to fetch user",
		})
		return
	}

	if receiver.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":"Receiver not found",
		})
		return
	}

	msg := models.Message{
		SenderID: senderID,
		ReceiverID: input.ReceiverID,
		Content: input.Content,
		MessageType: input.MessageType,
	}

	if err := config.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to send message",
		})
		return
	}

	upsertConversation(senderID, input.ReceiverID, input.Content)

	privatechat.Hub.DeliverMessage(input.ReceiverID, msg)

	c.JSON(http.StatusOK, gin.H{
		"message": "Message sent",
		"data":msg,
	})

}


func GetConversation(c *gin.Context) {

	me := c.GetString("userid")

	other := c.Param("userId")

	var messages []models.Message

	config.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) AND is_deleted = ?)",
		me,other, other, me, false,
	).
	Order("created_at ASC").
	Find(&messages)

	config.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?",
		other,
		me,
		false,
	).Update("is_read",true)

	c.JSON(http.StatusOK, gin.H{
		"data": messages,
	})
}

func GetConversations(c *gin.Context) {

	me := c.GetString("userid")

	var conversations []models.Conversation

	config.DB.
		Where("user1_id = ? OR user2_id = ?", me, me).
		Order("updated_at DESC").
		Find(&conversations)

	c.JSON(http.StatusOK, gin.H{
		"data": conversations,
	})

}

func DeleteMessage(c *gin.Context) {

	me := c.GetString("userid")
	msgID := c.Param("messageId")

	var msg models.Message

	config.DB.Where("id = ? AND sender_id = ?",msgID, me).First(&msg)

	if msg.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":"Message not found",
		})
		return
	}

	config.DB.Model(&msg).Update("is_deleted", true)

	c.JSON(http.StatusOK, gin.H{
		"message": "Message Deleted",
	})
}


func MarkMessageRead(c *gin.Context) {

	me := c.GetString("userid")
	msgID := c.Param("messageId")

	result := config.DB.Model(&models.Message{}).
		Where("id = ? AND receiver_id = ?",msgID, me).
		Update("is_read", true)

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":"Message not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":"Marked as read",
	})

}


func UnreadMessageCount(c *gin.Context) {

	me := c.GetString("userid")

	var count int64

	config.DB.Model(&models.Message{}).
		Where("receiver_id = ? AND is_read = ? AND is_deleted = ?", me, false, false).
		Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"unreadCount":count,
	})
	
}



func upsertConversation(senderID, receiverID, lastMsg string) {

	u1, u2 := senderID, receiverID

	if u1 > u2 {
		u1, u2 = u2, u1
	}

	var conv models.Conversation

	config.DB.Where("user1_id = ? AND user2_id = ?", u1, u2).First(&conv)

	if conv.ID == 0 {
		conv = models.Conversation{
			User1ID: u1,
			User2ID: u2,
			LastMessage: lastMsg,
			LastSender: senderID,
		}
		config.DB.Create(&conv)
	} else {
		config.DB.Model(&conv).Updates(map[string]interface{}{
			"last_message": lastMsg,
			"last_sender": senderID,
		})
	}

}