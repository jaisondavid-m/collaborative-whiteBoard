package middleware

import (
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type visitor struct {
	count int
	windowStart time.Time
}

var (
	visitors = make(map[string]*visitor)
	mu		sync.Mutex
)

type RateLimitConfig struct {
	Requests int	//max requests
	Window 	time.Duration  // per window
}

var (
	DefaultLimit = RateLimitConfig{Requests: 60, Window: time.Minute}
	AuthLimit  	 = RateLimitConfig{Requests: 10, Window: time.Minute}
	DrawLimit 	 = RateLimitConfig{Requests: 300, Window: time.Minute}
)

func RateLimit(cfg RateLimitConfig) gin.HandlerFunc {

	return func(c *gin.Context) {

		if os.Getenv("RATE_LIMIT_ENABLED") != "true" {
			c.Next()
			return
		}

		role, exists := c.Get("role")

		if exists && role == "superadmin" {
			c.Next()
			return
		}

		ip := c.ClientIP()

		mu.Lock()

		v, ok := visitors[ip]

		if !ok || time.Since(v.windowStart) > cfg.Window {
			visitors[ip] = &visitor{
				count: 1,
				windowStart: time.Now(),
			}
			mu.Unlock()
			c.Next()
			return
		}

		v.count++
		if v.count > cfg.Requests {
			mu.Unlock()
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":"Too many requests, slow down",
			})
			return
		}

		mu.Unlock()

		c.Next()

	}
}

// Cleanup old entries periodically
func StartRateLimiterCleanup() {

	go func() {
		ticker := time.NewTicker(5*time.Minute)
		for range ticker.C {
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.windowStart) > 10*time.Minute {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

}

