package handlers

import (

	"net/http"

	"server/config"
	"server/models"

	"github.com/gin-gonic/gin"

)

func ListUsers(c *gin.Context) {
	var users []models.User
	config.DB.Select("id,user_id,role,created_at").Find(&users)
	c.JSON(http.StatusOK,gin.H{
		"users":users,
	})
}

func UpdateRole(c *gin.Context) {

	var input models.UpdateRoleInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Input",
		})
		return
	}

	if input.Role != "user" && input.Role != "admin" {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Role must be 'user' or 'admin'",
		})
		return
	}

	var user models.User
	result := config.DB.Where("user_id = ?",input.UserID).First(&user)
	if result.Error != nil {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"User Not Found",
		})
		return
	}

	if user.Role == "superadmin" {
		c.JSON(http.StatusForbidden,gin.H{
			"error":"Cannot change superadmin role",
		})
		return
	}

	config.DB.Model(&user).Update("role",input.Role)
	c.JSON(http.StatusOK,gin.H{
		"message":"Role Updated Successfully",
	})

}