package handlers

import (
	"net/http"
	"time"

	"server/cache"
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

	if v, found := cache.C.Get(cache.TodayVisitKey); found {
		c.JSON(http.StatusOK, v)
		return
	}

	today := time.Now().Format("2006-01-02")

	var count int64

	config.DB.Model(&models.UserVisit{}).
		Where("visit_date = ?", today).
		Distinct("user_id").
		Count(&count)

	resp := gin.H{
		"date": today,
		"totalToday": count,
	}

	cache.C.Set(cache.TodayVisitKey, resp, 60*time.Second)

	// c.JSON(http.StatusOK, gin.H{
	// 	"date": today,
	// 	"totalToday": count,
	// })
	c.JSON(http.StatusOK, resp)

}

func MonthlyVisitGraph(c *gin.Context) {

	if v, found := cache.C.Get(cache.MonthlyVisitKey); found {
		c.JSON(http.StatusOK, v)
		return
	}

	now := time.Now()
	monthPrefix := now.Format("2006-01")

	var rows []models.Row

	config.DB.Model(&models.UserVisit{}).
		Select("visit_date, COUNT(DISTINCT user_id) as count").
		Where("visit_date LIKE ?", monthPrefix+"%").
		Group("visit_date").
		Order("visit_date ASC").
		Scan(&rows)

	resp := gin.H{
		"month": monthPrefix,
		"data": rows,
	}

	cache.C.Set(cache.MonthlyVisitKey, resp, 5*time.Minute)

	// c.JSON(http.StatusOK, gin.H{
	// 	"month": monthPrefix,
	// })

	c.JSON(http.StatusOK, resp)

}