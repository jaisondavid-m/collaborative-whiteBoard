package cache

import (
	"fmt"
	"time"

	gocache "github.com/patrickmn/go-cache"
)

var C = gocache.New(30*time.Second, 1*time.Minute)

func UserKey(userID string) string {
	return "user:" + userID
}

func FriendKey(userID string) string {
	return "friends:" + userID
}

func UnreadKey(userID string) string {
	return "unread:" + userID
}

const (
	AuditStatsKey = "audit:stats"
	MonthlyVisitKey = "stats:monthly"
	TodayVisitKey = "stats:today"
)

func Invalidateuser(userID string) {
	C.Delete(UserKey(userID))
}

func InvalidateFriends(userID string) {
	C.Delete(UnreadKey(userID))
}

func InvalidateUnread(userID string) {
	C.Delete(UnreadKey(userID))
}

func InvalidateStats() {
	C.Delete(AuditStatsKey)
	C.Delete(MonthlyVisitKey)
	C.Delete(TodayVisitKey)
}

func debugKey(prefix, id string) string {
	return fmt.Sprintf("%s:%s", prefix, id)
}