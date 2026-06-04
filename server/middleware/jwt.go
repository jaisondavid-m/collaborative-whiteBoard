package middleware

import (
	"net/http"
	"server/config"
	"server/models"
	"server/utils"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		tokenString := ""

		if authHeader == "" {
			tokenString = c.Query("token")
			if tokenString == "" {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Authorization heading is required",
				})
				c.Abort()
				return
			}
		} else {
			parts := strings.Split(authHeader, " ")

			if len(parts) != 2 {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error": "Invalid Authorization format",
				})
				c.Abort()
				return
			}

			tokenString = parts[1]
		}

		token, err := utils.VerifyJWT(tokenString)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid Token",
			})
			c.Abort()
			return
		}

		userid, _ := utils.ExtractClaims(token)
		role, _ := utils.ExtractRole(token)

		c.Set("userid",userid)
		c.Set("role",role)

		var user models.User
		config.DB.Where("user_id=? AND is_deleted=?",userid,false).First(&user)

		if user.ID == 0 {
			c.JSON(http.StatusUnauthorized,gin.H{
				"error":"Account has been deleted",
			})
			c.Abort()
			return
		}

		c.Next()

	}

}

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden,gin.H{
				"error":"No Role Found",
			})
			c.Abort()
			return
		}
		r := role.(string)
		if r != "admin" && r != "superadmin" {
			c.JSON(http.StatusForbidden,gin.H{
				"error":"Admin Access Required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}

func SuperAdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden,gin.H{
				"error":"No role found",
			})
			c.Abort()
			return
		}
		if role.(string) != "superadmin" {
			c.JSON(http.StatusForbidden,gin.H{
				"error":"Superadmin Access Required",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}