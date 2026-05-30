package middleware

import (

	"bytes"
	"encoding/json"
	"io"
	"server/config"
	"server/models"
	"time"

	"github.com/gin-gonic/gin"

)

type responseWriter struct {
	gin.ResponseWriter
	statusCode 		int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

func AuditMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _  = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		sanitized := sanitizeBody(bodyBytes)

		rw := &responseWriter{
			ResponseWriter: c.Writer,
			statusCode: 200,
		}

		c.Writer = rw

		start := time.Now()

		c.Next()

		duration := time.Since(start).Milliseconds()

		actorID, _ := c.Get("userid")
		actorRole, _ := c.Get("role")

		status := "success"

		if rw.statusCode >= 400 {
			status = "failure"
		}

		meta := map[string]any{
			"method":			c.Request.Method,
			"duration_ms":		duration,
			"body":				sanitized,
		}

		metaJSON, _ := json.Marshal(meta)

		log := models.AuditLog{
			ActorID : 	toString(actorID),
			ActorRole: toString(actorRole),
			Action: c.Request.Method + " " + c.FullPath(),
			TargetType: "endpoint",
			TargetID: c.Request.URL.Path,
			Meta: string(metaJSON),
			IP: c.ClientIP(),
			Status: status,
		}

		go config.DB.Create(&log)

	}

}

func sanitizeBody(raw []byte) map[string]any {

	if len(raw) == 0 {
		return nil
	}

	var parsed map[string]any
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil
	}

	redacted := "[REDACTED]"
	sensitive := []string{"password","token","secret","authorization"}

	for _, key := range sensitive {
		if _, ok := parsed[key]; ok {
			parsed[key] = redacted
		}
	}

	return parsed

}

func toString(v any) string {

	if v == nil {
		return ""
	}

	s, ok := v.(string)

	if !ok {
		return ""
	}

	return s
}