package handlers

import (

	"server/config"
	"server/models"
	"server/utils"

	"net/http"

	"github.com/gin-gonic/gin"

)

func Register(c *gin.Context) {

	var input models.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Input",
		})
		return
	}

	var existingUser models.User

	config.DB.Where("user_id = ?",input.UserID).First(&existingUser)

	if existingUser.ID != 0 {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"User Already Exists",
		})
		return
	}

	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Password Hasgin Failed",
		})
		return
	}

	user := models.User{
		UserID: input.UserID,
		Password: hashedPassword,
	}

	config.DB.Create(&user)

	token, err := utils.GenerateJWT(user.UserID)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Token Generation Failed",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"User Registered Successfully",
		"token":token,
	})
}

func Login(c *gin.Context) {

	var input models.RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Input",
		})
		return
	}

	var user models.User

	config.DB.Where("user_id = ?",input.UserID).First(&user)

	if user.ID == 0 {
		c.JSON(http.StatusUnauthorized,gin.H{
			"error":"Invalid credentials",
		})
		return
	}

	valid := utils.CheckPasswordHash(input.Password,user.Password)

	if !valid {
		c.JSON(http.StatusUnauthorized,gin.H{
			"error":"Invalid Credentials",
		})
		return
	}

	token, err := utils.GenerateJWT(user.UserID)

	if err != nil {
		c.JSON(http.StatusInternalServerError,gin.H{
			"error":"Token Generation Failed",
		})
		return
	}

	c.JSON(http.StatusOK,gin.H{
		"message":"Login Successfully",
		"token":token,
	})
}

func Profile(c *gin.Context) {
	c.JSON(http.StatusOK,gin.H{
		"message":"Protected route accessed",
	})
}