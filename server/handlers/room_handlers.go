package handlers

import (

	"net/http"

	"server/config"
	"server/models"
	"server/websocket"

	"github.com/gin-gonic/gin"
	gws "github.com/gorilla/websocket"

)

var upgrader = gws.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type CreateRoomRequest struct {
	RoomID		string 		`json:"roomId"`
	Name		string		`json:"name"`
}

func CreateRoom(c *gin.Context) {
	var body CreateRoomRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Invalid Body",
		})
		return
	}

	var existingRoom models.Room

	config.DB.Where("room_id = ?",body.RoomID).First(&existingRoom)

	if existingRoom.ID != 0 {
		c.JSON(http.StatusBadRequest,gin.H{
			"error":"Room already exists",
		})
		return
	}

	room := models.Room{
		RoomID: body.RoomID,
		Name: body.Name,
		IsActive: true,
	}

	config.DB.Create(&room)

	c.JSON(http.StatusOK,gin.H{
		"message":"Room Created Successfully",
		"room": room,
	})
}

func JoinRoom(c *gin.Context) {

	roomID := c.Param("roomid")

	var roomModel models.Room

	result := config.DB.Where("room_id = ?",roomID).First(&roomModel)

	if result.Error != nil {
		
		c.JSON(http.StatusNotFound,gin.H{
			"error":"Room Not Found",
		})
		return
	}

	runtimeRoom, exists := websocket.ActiveRooms[roomID]

	if !exists {

		runtimeRoom = websocket.NewRuntimeRoom(
			roomID,
		)

		websocket.ActiveRooms[roomID] = runtimeRoom

	}

	conn, err := upgrader.Upgrade(
		c.Writer,
		c.Request,
		nil,
	)

	if err != nil {
		return 
	}

	client := &websocket.Client{
		Conn: conn,
		Room: runtimeRoom,
	}

	runtimeRoom.Clients[client] = true

	go client.ReadMessages()

}