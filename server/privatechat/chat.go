package privatechat

import (
	"encoding/json"
	"log"
	"server/models"
	"sync"

	"github.com/gorilla/websocket"
)

var Hub = newHub()

type hub struct {
	mu 			sync.RWMutex
	clients		map[string]*Client
}

type PrivateEvent struct {
	Type 		string			`json:"type"`
	Payload		interface{} 	`json:"payload"`
}

type Client struct {
	Conn 		*websocket.Conn
	UserID 		string
	Send 		chan []byte
}

func newHub() *hub {
	return &hub{
		clients: make(map[string]*Client),
	}
}

func (h *hub) Register(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[c.UserID] = c
	log.Printf("[privatechat] %s connected.",c.UserID)
}

func (h *hub) Unregister(c *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if existing, ok := h.clients[c.UserID]; ok && existing == c {
		delete(h.clients,c.UserID)
		close(c.Send)
		log.Printf("[privatechat] %s disconnected",c.UserID)
	}
}

func (h *hub) DeliverMessage(receiverID string, msg models.Message) {

	h.mu.RLock()
	client, online := h.clients[receiverID]
	h.mu.RUnlock()

	if !online {
		return
	}

	data, err := json.Marshal(PrivateEvent{
		Type: "message",
		Payload: msg,
	})

	if err != nil {
		return
	}

	select {
	case client.Send <- data:
	default:
	}

}

//IsOnline can be used by other packages to check presence
func (h *hub) IsOnline(userID string) bool {

	h.mu.RLock()
	defer h.mu.RUnlock()
	_, ok := h.clients[userID]
	return ok

}


//--- Client ---

//ReadPump drains inbound frames

func (c *Client) ReadPump() {

	defer Hub.Unregister(c)

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
	}

}

//WritePump fans out messages from the send channel to the websocket
func (c *Client) WritePump() {

	defer c.Conn.Close()
	for msg := range c.Send {
		if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			log.Printf("[privatechat] write error for %s: %v",c.UserID,err)
			return
		}
	}

}