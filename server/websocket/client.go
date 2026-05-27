package websocket

import (
	"encoding/json"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn 	*websocket.Conn
	Room 	*RuntimeRoom
	UserID 	string
}

func (c *Client) ReadMessages() {

	defer func ()  {
		c.Room.mu.Lock()
		delete(c.Room.Clients,c)
		c.Room.mu.Unlock()
		c.Conn.Close()
	}()

	for {
		_, raw, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		var event DrawEvent
		if err := json.Unmarshal(raw, &event); err != nil {
			log.Printf("Invalid draw event from user %s: %v",c.UserID,err)
			continue
		}

		switch event.Type {
		case EventDraw, EventBegin, EventClear:
			event.UserID = c.UserID
			stamped, _ := json.Marshal(event)
			c.Room.Broadcast <- stamped
		default:
			log.Printf("Unknown event type %q from user %s",event.Type,c.UserID)
		}

		// c.Room.Broadcast <- message
	}

}