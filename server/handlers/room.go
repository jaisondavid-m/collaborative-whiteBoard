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
	RoomID string `json:"roomId"`
	Name   string `json:"name"`
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

	room := models.Room{
		RoomID:   body.RoomID,
		Name:     body.Name,
		IsActive: true,
	}

	config.DB.Create(&room)

	c.JSON(http.StatusOK, gin.H{
		"message": "Room Created Successfully",
		"room":    room,
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

	runtimeRoom, exists := websocket.ActiveRooms[roomID]
	if !exists {
		runtimeRoom = websocket.NewRuntimeRoom(roomID)
		websocket.ActiveRooms[roomID] = runtimeRoom
	}

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

	go client.ReadMessages()

}

func ListRooms(c *gin.Context) {

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

	var rooms []models.Room
	config.DB.Where("owner_id = ?",userID).Order("updated_at desc").Limit(10).Find(&rooms)

	type RoomResponse struct {
		models.Room
		Live 	bool 	`json:"live"`
		Users 	int 	`json:"users"`
	}

	result := make([]RoomResponse, len(rooms))
	for i, r := range rooms {
		rr := RoomResponse{Room: r}
		if active, ok := websocket.ActiveRooms[r.RoomID]; ok {
			rr.Live = true
			rr.Users = len(active.Clients)
		}
		result[i] = rr
	}
	c.JSON(http.StatusOK,gin.H{"rooms":result})
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
