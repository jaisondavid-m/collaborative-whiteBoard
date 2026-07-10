package handlers

import (
	"net/http"
	"time"

	"server/cache"
	"server/config"
	"server/models"

	"strconv"

	"github.com/gin-gonic/gin"
)

func ListAuditLogs(c *gin.Context) {

	// --- filters ---
	action := c.Query("action")
	actorID := c.Query("actor")
	status := c.Query("status")
	method := c.Query("method")
	dateFrom := c.Query("from")
	dateTo := c.Query("to")

	// --- Pagination ---
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 200 {
		limit = 50
	}
	offset := (page - 1) * limit

	query := config.DB.Model(&models.AuditLog{})

	if action != "" {
		query = query.Where("action LIKE ?", "%"+action+"%")
	}

	if actorID != "" {
		query = query.Where("actor_id = ?", actorID)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if method != "" {
		query = query.Where("action LIKE ?", method+"%")
	}

	if dateFrom != "" {
		query = query.Where("created_at >= ?", dateFrom)
	}

	if dateTo != "" {
		query = query.Where("created_at <= ?", dateTo+" 23:59:59")
	}

	var total int64

	query.Count(&total)

	var logs []models.AuditLog
	if err := query.Order("created_at desc").Limit(limit).Offset(offset).Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch audit logs",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": total,
		"page":  page,
		"limit": limit,
		"pages": (int(total) + limit - 1) / limit,
	})
}

func GetAuditStats(c *gin.Context) {

	if v, found := cache.C.Get(cache.AuditStatsKey); found {
		c.JSON(http.StatusOK, v)
		return
	}

	type ActionStat struct {
		Action string `json:"action"`
		Count  int64  `json:"count"`
	}

	type ActorStat struct {
		ActorID string `json:"actorId"`
		Count   int64  `json:"count"`
	}

	var totalRequests int64
	var failedRequests int64
	var actionStats []ActionStat
	var topActors []ActorStat

	config.DB.Model(&models.AuditLog{}).Count(&totalRequests)

	config.DB.Model(&models.AuditLog{}).Where("status = ?", "failure").Count(&failedRequests)

	config.DB.Model(&models.AuditLog{}).Select("action, count(*) as count").Group("action").Order("count desc").Limit(10).Scan(&actionStats)

	config.DB.Model(&models.AuditLog{}).Select("actor_id, count(*) as count").Where("actor_id != ?", "").Group("actor_id").Order("counter desc").Limit(5).Scan(&topActors)

	resp := gin.H{
		"total_requests":  totalRequests,
		"failed_requests": failedRequests,
		"success_rate":    successRate(totalRequests, failedRequests),
		"top_actions":     actionStats,
		"top_actors":      topActors,
	}

	cache.C.Set(cache.AuditStatsKey, resp, 30*time.Second)

	c.JSON(http.StatusOK, resp)

}

func successRate(total, failed int64) float64 {
	if total == 0 {
		return 100.0
	}
	return float64(total-failed) / float64(total) * 100
}
