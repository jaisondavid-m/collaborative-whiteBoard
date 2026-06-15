package handlers

import (

	"errors"
	"net/http"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

)

func SendFriendRequest(c *gin.Context) {

	senderID := c.GetString("userid")

	var input models.SendFriendRequestInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Invalid input",
		})
		return
	}

	if input.ReceiverID == senderID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Cannot send friend request to yourself",
		})
		return
	}

	var receiver models.User

	if err := config.DB.Where("user_id = ? AND is_deleted = ? AND is_blocked = ?", input.ReceiverID, false, false).First(&receiver).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "User not found",
			})
			return
		}
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	u1, u2 := senderID, input.ReceiverID
	if u1 > u2 {
		u1, u2 = u2, u1
	}

	var existingFriendship models.Friendship

	if err := config.DB.Where("user1_id = ? AND user2_id = ?",u1,u2).First(&existingFriendship).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Already friends",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	var existingRequest models.FriendRequest

	if err := config.DB.Where(
		"((sender_id ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
		senderID, input.ReceiverID, input.ReceiverID, senderID, "pending",
	).First(&existingRequest).Error; err == nil {

		if existingRequest.SenderID == senderID {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":"Friend request already sent",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "This user has already sent you a friend request",
			})
		}
		return 

	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	request := models.FriendRequest{
		SenderID: senderID,
		ReceiverID: input.ReceiverID,
		Status: "pending",
	}

	if err := config.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send friend request",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Friend request sent",
		"data": request,
	})

}