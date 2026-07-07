package handlers

import (

	"fmt"
	"net/http"
	"crypto/rand"

	"server/config"
	"server/models"
	"server/utils"

	"github.com/gin-gonic/gin"
	
)

func GuestLogin(c *gin.Context) {

	var userID string

	for i :=0; i < 5; i ++ {

		candidate, err := utils.GenerateGuestID()

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create guest account",
			})
			return
		}

		var existing models.User

		if err := config.DB.Where("user_id = ?", candidate).First(&existing).Error; err != nil {
			userID = candidate
			break
		}

	}

	if userID == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Count not allocate a guest ID, please try again",
		})
		return
	}

	randomBytes := make([]byte, 16)

	if _, err := rand.Read(randomBytes); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest account",
		})
		return
	}

	hashedPassword, err := utils.HashPassword(fmt.Sprintf("%x", randomBytes))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest account",
		})
		return
	}

	user := models.User{
		UserID: userID,
		Password: hashedPassword,
		Role: "guest",
		IsGuest: true,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest account",
		})
		return
	}

	token, err := utils.GenerateJWT(user.UserID, user.Role)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return 
	}

	if err := config.DB.Model(&user).Update("current_token", token).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create guest account",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Guest account created",
		"token": token, 
		"userid": user.UserID,
		"role": user.Role,
	})

}