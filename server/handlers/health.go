package handlers

import (
	
	"net/http"
	"server/config"

	"github.com/gin-gonic/gin"

)

func HealthCheck(c *gin.Context) {

	dbOk := true

	sqlDB, err := config.DB.DB()

	if err != nil || sqlDB.Ping() != nil {
		dbOk = false
	}

	status := "ok"
	code := http.StatusOK

	if !dbOk {
		status = "degraded"
		code = http.StatusServiceUnavailable
	}

	c.JSON(code, gin.H{
		"status": status,
		"database": dbOk,
	})
}