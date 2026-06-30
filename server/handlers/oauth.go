package handlers

import (
	"context"
	"net/http"
	"os"

	"server/config"
	"server/models"
	"server/utils"
	
	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

var GoogleClientID = os.Getenv("GOOGLE_CLIENT_ID")

func GoogleLogin(c *gin.Context) {
	var req models.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"message":"Invalid request",
		})
		return
	}
	payload, err := idtoken.Validate(context.Background(),req.Token,GoogleClientID)
	if err != nil {
		c.JSON(http.StatusUnauthorized,gin.H{
			"message":"Invalid Google Token",
		})
		return
	}

	googleId, _ := payload.Claims["sub"].(string)
	name, _ := payload.Claims["name"].(string)
	email, _ := payload.Claims["email"].(string)
	picture, _ := payload.Claims["picture"].(string)

	_ = name
	_ = email
	_ = picture

	var user models.User

	result := config.DB.Where("user_id = ?",googleId).First(&user)

	if result.Error != nil {
		user = models.User{
			UserID: googleId,
			Password: "",
		}
		if err := config.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError,gin.H{
				"error":"Failed to create user",
			})
			return
		}
	}

	token, err := utils.GenerateJWT(user.UserID, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Token Generation Failed",
		})
		return
	}

	if err := config.DB.Model(&user).Update("current_token", token).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update session",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Login Successfully",
		"token":token,
		"role": user.Role,
		"userid":user.UserID,
	})
}