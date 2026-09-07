package handlers

import (
	"log"
	"net/http"
	"server/privatechat"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var privateUpgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true } , 
}

func PrivateChatWS(c *gin.Context) {

	userID := c.GetString("userid")

	conn, err := privateUpgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Private WS upgrade err for %s: %v",userID, err)
		return
	}

	client := &privatechat.Client{
		Conn: conn,
		UserID: userID,
		Send: make(chan []byte, 128),
	}

	privatechat.Hub.Register(client)

	go client.WritePump()
	client.ReadPump() //blocks until disconnect

}

func RoomWS(c *gin.Context) {

	userID := c.GetString("userid")
	roomID := c.Param("roomId")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf(
			"Room WS upgrade error user=%s room=%s: %v",
			userID,
			roomID,
			err,
		)
		return 
	}

	room := GetOrCreateRoom(roomID)

	client := &Client{
		Conn: conn,
		Room: room,
		UserID: userID,
		Send: make(chan []byte, 256),
	}

	room.AddClient(client)

	go client.WritePump()

	room.SendHistory(client)

	client.ReadMessages()

}