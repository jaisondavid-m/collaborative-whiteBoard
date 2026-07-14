package handlers

import (
	"net/http"

	"server/config"
	"server/models"
	"server/utils"
	"server/websocket"
	"strings"

	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"
)

var upgrader = gws.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type CreateRoomRequest struct {
	RoomID 		string 		`json:"roomId"`
	Name   		string 		`json:"name"`
	Password 	string 		`json:"password"`
}

func CreateRoom(c *gin.Context) {
	var body CreateRoomRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid Body",
		})
		return
	}

	var existingRoom models.Room

	config.DB.Where("room_id = ?", body.RoomID).First(&existingRoom)

	if existingRoom.ID != 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Room already exists",
		})
		return
	}

	hashedPassword := ""
	if body.Password != "" {
		h, err := utils.HashPassword(body.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError,gin.H{
				"error":"Failed to hash password",
			})
			return
		}
		hashedPassword = h
	}

	userID, exists := c.Get("userID")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	ownerID, ok := userID.(uint)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user context",
		})
		return
	}

	room := models.Room{
		RoomID:   body.RoomID,
		Name:     body.Name,
		OwnerID: ownerID,
		IsActive: true,
		Password: hashedPassword,
	}

	config.DB.Create(&room)

	c.JSON(http.StatusOK, gin.H{
		"message": "Room Created Successfully",
		"room":    room,
		"isProctected": hashedPassword != "",
	})
}

func JoinRoom(c *gin.Context) {

	roomID := c.Param("roomId")

	var roomModel models.Room

	if err := config.DB.Where("room_id = ?", roomID).First(&roomModel).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Room not found",
		})
		return
	}

	if roomModel.Password != "" {
		provided := c.Query("password")
		if provided == "" || !utils.CheckPasswordHash(provided, roomModel.Password) {
			c.JSON(http.StatusUnauthorized,gin.H{
				"error":"Invalid Room Password",
			})
			return
		}
	}

	userID := ""
	tokenStr := c.Query("token")

	if tokenStr == "" {
		auth := c.GetHeader("Authorization")
		parts := strings.Split(auth, " ")
		if len(parts) == 2 {
			tokenStr = parts[1]
		}
	}

	if tokenStr != "" {
		if token, err := utils.VerifyJWT(tokenStr); err == nil && token.Valid {
			if claims, ok := utils.ExtractClaims(token); ok {
				userID = claims
			}
		}
	}

	runtimeRoom := websocket.GetOrCreateRoom(roomID)

	// if !exists {
	// 	runtimeRoom = websocket.NewRuntimeRoom(roomID)
	// 	websocket.ActiveRooms[roomID] = runtimeRoom
	// }

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := &websocket.Client{
		Conn:   conn,
		Room:   runtimeRoom,
		UserID: userID,
	}

	runtimeRoom.AddClient(client)

	runtimeRoom.SendHistory(client)
	runtimeRoom.SendChatHistory(client)

	go client.WritePump()
	go client.ReadMessages()

}

func ListRooms(c *gin.Context) {

	userIDVal, exists := c.Get("userID")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	ownerID, ok := userIDVal.(uint)

	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid user context",
		})
		return
	}

	// tokenStr := c.Query("token")

	// if tokenStr == "" {
	// 	auth := c.GetHeader("Authorization")
	// 	parts := strings.Split(auth, " ")
	// 	if len(parts) == 2 {
	// 		tokenStr = parts[1]
	// 	}
	// }

	// if tokenStr != "" {
	// 	if token, err := utils.VerifyJWT(tokenStr); err == nil && token.Valid {
	// 		if claims, ok := utils.ExtractClaims(token); ok {
	// 			userID = claims
	// 		}
	// 	}
	// }

	var rooms []models.Room

	result := config.DB.Where("owner_id = ?",ownerID).Order("updated_at desc").Limit(10).Find(&rooms)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch rooms",
		})
		return
	}

	type RoomResponse struct {
		models.Room
		Live 	bool 	`json:"live"`
		Users 	int 	`json:"users"`
	}

	// result := make([]RoomResponse, len(rooms))
	// for i, r := range rooms {
	// 	rr := RoomResponse{Room: r}
	// 	if active, ok := websocket.GetRoom(r.RoomID); ok {
	// 		rr.Live = true
	// 		rr.Users = len(active.Clients)
	// 	}
	// 	result[i] = rr
	// }

	c.JSON(http.StatusOK,gin.H{"rooms":rooms})
}

func CheckRoomPassword(c *gin.Context) {

	roomID := c.Param("roomId")

	var body struct {
		Password string	`json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Body",
		})
		return
	}

	var room models.Room
	if err := config.DB.Where("room_id = ?",roomID).First(&room).Error; err != nil {
		c.JSON(http.StatusNotFound,gin.H{
			"error":"Room Not Found",
		})
		return 
	}

	if room.Password == "" {
		c.JSON(http.StatusOK,gin.H{
			"ok": true,
			"isProtected":false,
		})
		return 
	}

	if !utils.CheckPasswordHash(body.Password, room.Password) {
		c.JSON(http.StatusForbidden,gin.H{
			"error":"Wrong Password",
		})
		return 
	}

	c.JSON(http.StatusOK,gin.H{
		"ok":true,
		"isProctected":true,
	})

}

// func JoinRoom(c *gin.Context) {

// 	roomID := c.Param("roomid")

// 	var roomModel models.Room

// 	result := config.DB.Where("room_id = ?",roomID).First(&roomModel)

// 	if result.Error != nil {

// 		c.JSON(http.StatusNotFound,gin.H{
// 			"error":"Room Not Found",
// 		})
// 		return
// 	}

// 	runtimeRoom, exists := websocket.ActiveRooms[roomID]

// 	if !exists {

// 		runtimeRoom = websocket.NewRuntimeRoom(
// 			roomID,
// 		)

// 		websocket.ActiveRooms[roomID] = runtimeRoom

// 	}

// 	conn, err := upgrader.Upgrade(
// 		c.Writer,
// 		c.Request,
// 		nil,
// 	)

// 	if err != nil {
// 		return
// 	}

// 	client := &websocket.Client{
// 		Conn: conn,
// 		Room: runtimeRoom,
// 	}

// 	runtimeRoom.Clients[client] = true

// 	go client.ReadMessages()

// }
