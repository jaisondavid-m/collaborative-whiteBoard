package middleware

import (
	"server/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized,gin.H{
				"error":"Authorization heading is required",
			})
			c.Abort()
			return
		}

		tokenString := strings.Split(authHeader, " ")

		if len(tokenString) != 2 {
			c.JSON(http.StatusUnauthorized,gin.H{
				"error":"Invalid Authorization format",
			})
			c.Abort()
			return
		}

		token, err := utils.VerifyJWT(tokenString[1])

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