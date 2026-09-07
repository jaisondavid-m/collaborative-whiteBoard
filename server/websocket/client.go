package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	pongWait = 60 * time.Second
	pingPeriod = (pongWait * 9) / 10
)


type Client struct {
	Conn 	*websocket.Conn
	Room 	*RuntimeRoom
	UserID 	string
	Send chan []byte
}

func (c *Client) WritePump() {

	ticker := time.NewTicker(pingPeriod)

	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				// c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return 
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return 
			}
		case <-ticker.C:
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}

	// for range ticker.C {
	// 	if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
	// 		return
	// 	}
	// }
}

func (c *Client) ReadMessages() {

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))

	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	defer func() {
		c.Room.RemoveClient(c)
	}()

	// defer func ()  {
	// 	c.Room.mu.Lock()
	// 	delete(c.Room.Clients,c)
	// 	c.Room.mu.Unlock()
	// 	c.Conn.Close()
	// 	c.Room.broadcastPresence()
	// 	c.Room.CleanupIfEmpty()
	// }()

	for {
		_, raw, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}

		var peek struct {
			Type string	`json:"type"`
		}
		if err := json.Unmarshal(raw, &peek); err != nil {
			continue
		}

		switch peek.Type {
		case EventDraw, EventBegin, EventClear, EventShape:
			var event DrawEvent
			if err := json.Unmarshal(raw, &event); err != nil {
				log.Printf("Invalid draw event : %v",err)
				continue
			}
			event.UserID = c.UserID
			c.Room.mu.Lock()

			if event.Type == EventClear {
				c.Room.History = []DrawEvent{}
			} else if event.Type != EventBegin {
				c.Room.History = append(c.Room.History, event)
			}
			c.Room.mu.Unlock()

			stamped, err := json.Marshal(event)
			if err != nil {
				continue
			}
			c.Room.Broadcast <- stamped

		case EventChat:
			var msg ChatMessage
			if err := json.Unmarshal(raw, &msg); err != nil {
				log.Printf("Invalid chat message: %v",err)
				continue
			}

			msg.UserID = c.UserID
			c.Room.HandleChat(msg)
		default:
			log.Printf("Unknown event type %q from user %s",peek.Type, c.UserID)
		}
		// var event DrawEvent
		// if err := json.Unmarshal(raw, &event); err != nil {
		// 	log.Printf("Invalid draw event from user %s: %v",c.UserID,err)
		// 	continue
		// }

		// switch event.Type {
		// case EventDraw, EventBegin, EventClear:
		// 	event.UserID = c.UserID
		// 	stamped, _ := json.Marshal(event)
		// 	c.Room.Broadcast <- stamped
		// default:
		// 	log.Printf("Unknown event type %q from user %s",event.Type,c.UserID)
		// }

		// c.Room.Broadcast <- message
	}

}

func (r *RuntimeRoom) AddClient(c *Client) {

	r.mu.Lock()

	r.Clients[c] = true

	if r.cleanupTimer != nil {
		r.cleanupTimer.Stop()
		r.cleanupTimer = nil
	}

	r.mu.Unlock()
	
	r.broadcastPresence()

}

