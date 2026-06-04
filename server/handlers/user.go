package handlers

import (
	"net/http"
	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"
)

func DeleteAccount(c *gin.Context) {

	userid, exists := c.Get("userid")

	if !exists {
		c.JSON(http.StatusUnauthorized,gin.H{
			"error":"Unauthorized",
		})
		return
	}

	var user models.User

	result := config.DB.Where("user_id=?",userid).First(&user)

	if result.Error != nil || user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":"User not found",
		})
		return
	}

	if user.UserID != userid.(string) {
		c.JSON(http.StatusForbidden,gin.H{
			"error":"Forbidden",
		})
		return
	}

	if err := config.DB.Model(&user).Update("is_deleted",true).Error; err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Failed to delete account.",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Account deleted successfully",
	})

}