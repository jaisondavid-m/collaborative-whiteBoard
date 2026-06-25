package handlers

import (
	
	"errors"
	"net/http"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

)

func BlockUser(c *gin.Context) {

	me := c.GetString("userid")
	targetID := c.Param("userId")

	if me == targetID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Cannot block yourself",
		})
		return
	}

	var target models.User

	if err := config.DB.Where(
		"user_id = ? AND is_deleted = ? AND is_blocked = ?",
		targetID,
		false,
		false,
	).First(&target).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":"User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	var existing models.Block

	if err := config.DB.Where("blocker_id = ? AND blocked_id = ?", me, targetID).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"User already blocked",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	block := models.Block{
		BlockerID: me,
		BlockedID: targetID,
	}

	if err := config.DB.Create(&block).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to block user",
		})
		return
	}

	u1, u2 := me, targetID

	if u1 > u2 {
		u1, u2 = u2, u1
	}

	config.DB.Where("user1_id = ? AND user2_id = ?", u1, u2).Delete(&models.Friendship{})

	config.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
		me, targetID, targetID, me, "pending",
	).Delete(&models.FriendRequest{})

	c.JSON(http.StatusOK, gin.H{
		"message": "User blocked",
	})

}

func UnblockUser(c *gin.Context) {

	me := c.GetString("userid")
	targetID := c.Param("userId")

	result := config.DB.Where("blocker_id = ? AND blocked_id = ?", me, targetID).Delete(&models.Block{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to unblock user",
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Block not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User unblocked",
	})

}

func GetBlockedList(c *gin.Context) {

	me := c.GetString("userid")

	var blocks []models.Block

	if err := config.DB.Where("blocker_id = ?", me).Find(&blocks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Failed to fetch blocked users",
		})
		return
	}

	blockedIDs := make([]string, 0, len(blocks))

	for _ ,b := range blocks {
		blockedIDs = append(blockedIDs, b.BlockedID)
	}

	var users []models.User

	if len(blockedIDs) > 0 {
		if err := config.DB.Where("user_id IN ?", blockedIDs).Find(&users).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":"Failed to fetch user details",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data":users,
	})

}

func IsBlockedByUser(c *gin.Context) {

	me := c.GetString("userid")
	targetID := c.Param("userId")

	var block models.Block
	err := config.DB.Where("blocker_id = ? AND blocked_id = ?", targetID, me).First(&block).Error;

	if err == nil {
		c.JSON(http.StatusOK, gin.H{
			"blocked": true,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"blocked": false,
	})
}