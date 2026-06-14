package handlers

import (

	"errors"
	"net/http"

	"server/config"
	"server/models"
	"server/privatechat"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

)

func SendMessage(c *gin.Context) {

	senderID := c.GetString("userid")

	var input models.SendMessageInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input",
		})
		return
	}

	if input.MessageType == "" {
		input.MessageType = "text"
	}

	var receiver models.User

	if err := config.DB.Where("user_id = ? AND is_deleted = ? AND is_blocked= ?", input.ReceiverID, false, false).First(&receiver).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":"Receiver not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	// err != nil {
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"error":"Failed to fetch user",
	// 	})
	// 	return
	// }

	// if receiver.ID == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{
	// 		"error": "Receiver not found",
	// 	})
	// 	return
	// }

	msg := models.Message{
		SenderID:    senderID,
		ReceiverID:  input.ReceiverID,
		Content:     input.Content,
		MessageType: input.MessageType,
	}

	if err := config.DB.Create(&msg).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send message",
		})
		return
	}

	if err := upsertConversation(senderID, input.ReceiverID, input.Content); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to update conversation",
		})
		return
	}

	privatechat.Hub.DeliverMessage(input.ReceiverID, msg)

	c.JSON(http.StatusOK, gin.H{
		"message": "Message sent",
		"data":    msg,
	})

}

func GetConversation(c *gin.Context) {

	me := c.GetString("userid")

	other := c.Param("userId")

	var messages []models.Message

	if err := config.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND is_deleted = ?",
		me, other, other, me, false,
	).
		Order("created_at ASC").
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch messages",
		})
		return
	}

	if err := config.DB.Model(&models.Message{}).
		Where("sender_id = ? AND receiver_id = ? AND is_read = ?",
			other,
			me,
			false,
		).Update("is_read", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update messages",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": messages,
	})
}

func GetConversations(c *gin.Context) {

	me := c.GetString("userid")

	var conversations []models.Conversation

	if err := config.DB.
		Where("user1_id = ? OR user2_id = ?", me, me).
		Order("updated_at DESC").
		Find(&conversations).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":"Failed to fetch conversations",
			})
			return
		}

	c.JSON(http.StatusOK, gin.H{
		"data": conversations,
	})

}

func DeleteMessage(c *gin.Context) {

	me := c.GetString("userid")
	msgID := c.Param("messageId")

	var msg models.Message

	if err := config.DB.Where("id = ? AND sender_id = ?", msgID, me).First(&msg).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":"Message not found",
		})
		return
	}

	// if msg.ID == 0 {
	// 	c.JSON(http.StatusNotFound, gin.H{
	// 		"error": "Message not found",
	// 	})
	// 	return
	// }

if err := config.DB.Model(&msg).Update("is_deleted", true).Error; err != nil {
	c.JSON(http.StatusInternalServerError, gin.H{
		"error":"Failed to delete message",
	})
	return
}

	c.JSON(http.StatusOK, gin.H{
		"message": "Message Deleted",
	})
}

func MarkMessageRead(c *gin.Context) {

	me := c.GetString("userid")
	msgID := c.Param("messageId")

	result := config.DB.Model(&models.Message{}).
		Where("id = ? AND receiver_id = ?", msgID, me).
		Update("is_read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to update message",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Message not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Marked as read",
	})

}

func UnreadMessageCount(c *gin.Context) {

	me := c.GetString("userid")

	var count int64

	if err := config.DB.Model(&models.Message{}).
		Where("receiver_id = ? AND is_read = ? AND is_deleted = ?", me, false, false).
		Count(&count).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":"Failed to get unread count",
			})
			return
		}

	c.JSON(http.StatusOK, gin.H{
		"unreadCount": count,
	})

}

func upsertConversation(senderID, receiverID, lastMsg string) error {

	u1, u2 := senderID, receiverID

	if u1 > u2 {
		u1, u2 = u2, u1
	}

	var conv models.Conversation

	if err := config.DB.Where("user1_id = ? AND user2_id = ?", u1, u2).First(&conv).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			conv = models.Conversation{
				User1ID: u1,
				User2ID: u2,
				LastMessage: lastMsg,
				LastSender: senderID,
			}
			if err := config.DB.Create(&conv).Error; err != nil {
				return err
			}
		} else {
			return err
		}
	} else {
		if err := config.DB.Model(&conv).Updates(map[string]interface{}{
			"last_message":lastMsg,
			"last_sender":senderID,
		}).Error; err != nil {
			return err
		}
	}

	// if conv.ID == 0 {
	// 	conv = models.Conversation{
	// 		User1ID:     u1,
	// 		User2ID:     u2,
	// 		LastMessage: lastMsg,
	// 		LastSender:  senderID,
	// 	}
	// 	config.DB.Create(&conv)
	// } else {
	// 	config.DB.Model(&conv).Updates(map[string]interface{}{
	// 		"last_message": lastMsg,
	// 		"last_sender":  senderID,
	// 	})
	// }
	return nil
}
