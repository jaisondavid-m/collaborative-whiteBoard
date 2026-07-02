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
	// defer h.mu.Unlock()
	h.clients[c.UserID]  = c
	h.mu.Unlock()
	// h.clients[c.UserID] = c
	log.Printf("[privatechat] %s connected.",c.UserID)
	h.BroadcastPresence(c.UserID, true)
}

func (h *hub) Unregister(c *Client) {

	h.mu.Lock()
	// defer h.mu.Unlock()
	_, existed := h.clients[c.UserID]
	if existed {
		if existing, ok := h.clients[c.UserID]; ok && existing == c {
			delete(h.clients,c.UserID)
			close(c.Send)
		}
	}
	h.mu.Unlock()
	if existed {
		log.Printf("[privatechat] %s disconnected",c.UserID)
		h.BroadcastPresence(c.UserID, false)
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
		_, data, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		var event PrivateEvent
		if err := json.Unmarshal(data, &event); err != nil {
			continue
		}
		if event.Type == "typing" {
			payload, ok := event.Payload.(map[string]interface{})
			if !ok {
				continue
			}
			receiverID, _ := payload["receiverId"].(string)
			typing, _ := payload["typing"].(bool)
			if receiverID != "" {
				Hub.SendTyping(receiverID, c.UserID, typing)
			}
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


func (h *hub) SendTyping(receiverID, senderID string, typing bool) {

	h.mu.RLock()
	client, online := h.clients[receiverID]
	h.mu.RUnlock()

	if !online {
		return
	}

	data, err := json.Marshal(PrivateEvent{
		Type: "typing",
		Payload: map[string]interface{}{
			"senderId": senderID,
			"typing": typing,
		},
	})

	if err != nil {
		return
	}

	select {
	case client.Send <- data:
	default:
	}

}

func (h *hub) BroadcastPresence(userID string, online bool) {

	h.mu.RLock()
	defer h.mu.RUnlock()

	data, err := json.Marshal(PrivateEvent{
		Type: "presence",
		Payload: map[string]interface{}{
			"userId": userID,
			"online": online,
		},
	})

	if err != nil {
		return
	}

	for id, client := range h.clients {
		if id == userID {
			continue
		}
		select {
		case client.Send <- data:
		default:
		}
	}
}

func (h *hub) OnlineCount() int {

	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)

}

func (h *hub) OnlineUserIDs() []string {

	h.mu.Lock()
	defer h.mu.RUnlock()
	ids := make([]string, 0, len(h.clients))

	for id := range h.clients {
		ids = append(ids, id)
	}

	return ids

}