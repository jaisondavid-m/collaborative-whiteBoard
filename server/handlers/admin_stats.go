package handlers

import (

	"time"
	"net/http"

	"server/config"
	"server/models"
	"server/privatechat"

	"github.com/gin-gonic/gin"

)

func OnlineUsersStats(c *gin.Context) {

	c.JSON(http.StatusOK, gin.H{
		"onlineCount": privatechat.Hub.OnlineCount(),
		"onlineUsers": privatechat.Hub.OnlineUserIDs(),
	})

}

func TodayVisitStats(c *gin.Context) {

	today := time.Now().Format("2006-01-02")

	var count int64

	config.DB.Model(&models.UserVisit{}).
		Where("visit_date = ?", today).
		Distinct("user_id").
		Count(&count)

	c.JSON(http.StatusOK, gin.H{
		"date": today,
		"totalToday": count,
	})

}

func MonthlyVisitGraph(c *gin.Context) {

	now := time.Now()
	monthPrefix := now.Format("2006-01")

	var rows []models.Row

	config.DB.Model(&models.UserVisit{}).
		Select("visit_date, COUNT(DISTINCT user_id) as count").
		Where("visit_date LIKE ?", monthPrefix+"%").
		Group("visit_date").
		Order("visit_date ASC").
		Scan(&rows)

	c.JSON(http.StatusOK, gin.H{
		"month": monthPrefix,
		"data": rows,
	})

}