package middleware

import (
	"net/http"
	"strings"
	"server/utils"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		tokenString := ""

		if authHeader == "" {
			tokenString = c.Query("token")
			if tokenString == "" {
				c.JSON(http.StatusUnauthorized,gin.H{
					"error":"Authorization heading is required",
				})
				c.Abort()
				return
			}
		} else {
			parts := strings.Split(authHeader, " ")

			if len(parts) != 2 {
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":"Invalid Authorization format",
				})
				c.Abort()
				return
			}

			tokenString = parts[1]
		}

		token, err := utils.VerifyJWT(tokenString)

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":"Invalid Token",
			})
			c.Abort()
			return
		}

		c.Next()

	}

}