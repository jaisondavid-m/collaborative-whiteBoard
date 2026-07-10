package handlers

import (
	"errors"
	"net/http"
	"time"

	"server/cache"
	"server/config"
	"server/models"
	"server/utils"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SendFriendRequest(c *gin.Context) {

	senderID := c.GetString("userid")

	var input models.SendFriendRequestInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Invalid input",
		})
		return
	}

	if input.ReceiverID == senderID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Cannot send friend request to yourself",
		})
		return
	}

	if _, err := utils.GetActiveUser(input.ReceiverID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "User not found",
			})
			return 
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return 
	}

	// var receiver models.User

	// if err := config.DB.Where("user_id = ? AND is_deleted = ? AND is_blocked = ?", input.ReceiverID, false, false).First(&receiver).Error; err != nil {

	// 	if errors.Is(err, gorm.ErrRecordNotFound) {
	// 		c.JSON(http.StatusNotFound, gin.H{
	// 			"error": "User not found",
	// 		})
	// 		return
	// 	}
		
	// 	c.JSON(http.StatusInternalServerError, gin.H{
	// 		"error":"Database error",
	// 	})
	// 	return
	// }
	
	var blockCheck models.Block

	if err := config.DB.Where(
		"(blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)",
		senderID, input.ReceiverID, input.ReceiverID, senderID,
	).First(&blockCheck).Error; err == nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error":"Cannot send friend request to this user",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	u1, u2 := senderID, input.ReceiverID
	if u1 > u2 {
		u1, u2 = u2, u1
	}

	var existingFriendship models.Friendship

	if err := config.DB.Where("user1_id = ? AND user2_id = ?",u1,u2).First(&existingFriendship).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":"Already friends",
		})
		return
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	var existingRequest models.FriendRequest

	if err := config.DB.Where(
		"((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)) AND status = ?",
		senderID, input.ReceiverID, input.ReceiverID, senderID, "pending",
	).First(&existingRequest).Error; err == nil {

		if existingRequest.SenderID == senderID {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":"Friend request already sent",
			})
		} else {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "This user has already sent you a friend request",
			})
		}
		return 

	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	request := models.FriendRequest{
		SenderID: senderID,
		ReceiverID: input.ReceiverID,
		Status: "pending",
	}

	if err := config.DB.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to send friend request",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Friend request sent",
		"data": request,
	})

}

func GetPendingRequests(c *gin.Context) {

	me := c.GetString("userid")

	var requests []models.FriendRequest

	if err := config.DB.Where("receiver_id = ? AND status = ?", me, "pending").Order("created_at DESC").Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch friend requests",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": requests,
	})

}


func RespondFriendRequest(c *gin.Context) {

	me := c.GetString("userid")
	reqID := c.Param("requestId")

	var input struct {
		Action 			string			`json:"action" binding:"required,oneof=accept reject"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid input, action must be 'accept' or 'reject'",
		})
		return
	}

	var request models.FriendRequest

	if err := config.DB.Where("id = ? AND receiver_id = ? AND status = ?", reqID, me, "pending").First(&request).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":"Friend request not Found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":"Database error",
		})
		return
	}

	if input.Action == "accept" {

		var blockCheck models.Block

		if err := config.DB.Where(
			"(blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)",
			request.SenderID, request.ReceiverID, request.ReceiverID, request.SenderID,
		).First(&blockCheck).Error; err == nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Cannot accept request, a block exists between users",
			})
			return
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Database error",
			})
			return
		}

		u1, u2 := request.SenderID, request.ReceiverID

		if u1 > u2 {
			u1, u2 = u2, u1
		}

		friendship := models.Friendship{
			User1ID: u1,
			User2ID: u2,
		}

		if err := config.DB.Create(&friendship).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to accept friend request",
			})
			return
		}

		request.Status = "accepted"

		cache.InvalidateFriends(request.SenderID)
		cache.InvalidateFriends(request.ReceiverID)

	} else {
		request.Status = "rejected"
	}

	if err := config.DB.Save(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update friend request",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Friend request " + request.Status,
		"data": request,
	})

}


func GetFriendsList(c *gin.Context) {

	me := c.GetString("userid")

	if v, found := cache.C.Get(cache.FriendKey(me)); found {
		c.JSON(http.StatusOK, gin.H{
			"data": v,
		})
		return 
	}

	var friendships []models.Friendship

	if err := config.DB.Where("user1_id = ? OR user2_id = ?", me, me).Find(&friendships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch friends",
		})
		return
	}

	friendIDs := make([]string, 0, len(friendships))
	friendshipByUserID := make(map[string]uint, len(friendships))


	for _, f := range friendships {

		var otherID string

		if f.User1ID == me {
			otherID = f.User2ID
		} else {
			otherID = f.User1ID
		}

		// if f.User1ID == me {
		// 	friendIDs = append(friendIDs, f.User2ID)
		// } else {
		// 	friendIDs = append(friendIDs, f.User1ID)
		// }

		friendIDs = append(friendIDs, otherID)
		friendshipByUserID[otherID] = f.ID
	}

	var friends []models.User

	if len(friendIDs) > 0 {
		
		if err := config.DB.Where(
			"user_id IN ? AND is_deleted = ? AND is_blocked = ?", friendIDs, false, false,
		).Find(&friends).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":"Failed to fetch friends",
			})
			return
		}
	}

	result := make([]models.FriendInfo, 0, len(friends))

	for _, u := range friends {
		result = append(result, models.FriendInfo{
			FriendshipID: friendshipByUserID[u.UserID],
			UserID: u.UserID,
			Role: u.Role,
		})
	}

	cache.C.Set(cache.FriendKey(me), result, 60*time.Second)

	c.JSON(http.StatusOK, gin.H{
		"data": result,
	})

}

func RemoveFriend(c *gin.Context) {

	me := c.GetString("userid")

	friendshipID := c.Param("friendshipId")

	var friendship models.Friendship

	if err := config.DB.Where(
		"id = ? AND (user1_id = ? OR user2_id = ?)",
		friendshipID, me, me,
	).First(&friendship).Error; err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Friendship not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return

	}

	if err := config.DB.Delete(&friendship).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to remove friend",
		})
		return
	}

	cache.InvalidateFriends(friendship.User1ID)
	cache.InvalidateFriends(friendship.User2ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Friend removed",
	})

}