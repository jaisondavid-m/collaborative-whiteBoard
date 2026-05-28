package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"
)

type RuntimeRoom struct {
	RoomID		string
	Clients		map[*Client]bool
	Broadcast	chan []byte
	mu			sync.Mutex
	History		[]DrawEvent
	ChatHistory []ChatMessage
}

func (r *RuntimeRoom) AddClient(c *Client) {
	r.mu.Lock()
	r.Clients[c] = true
	r.mu.Unlock()
	r.broadcastPresence()
}

func NewRuntimeRoom(roomID string) *RuntimeRoom {

	room := &RuntimeRoom{
		RoomID: roomID,
		Clients: make(map[*Client]bool),
		Broadcast: make(chan []byte),
		History: []DrawEvent{},
		ChatHistory: []ChatMessage{},
	}

	go room.Run()

	return room

}

func (r *RuntimeRoom) Run() {

	for raw := range r.Broadcast {

		var event DrawEvent
		if err := json.Unmarshal(raw, &event); err == nil {
			r.mu.Lock()
			switch event.Type {
			case EventClear:
				r.History = []DrawEvent{}
			case EventDraw, EventBegin:
				r.History = append(r.History, event)
			}
			// if event.Type == EventClear {
			// 	r.History = []DrawEvent{}
			// } else if event.Type == EventDraw || event.Type == EventBegin {
			// 	r.History = append(r.History, event)
			// }
			r.mu.Unlock()
		}
		r.mu.Lock()
		for client := range r.Clients {
			if err := client.Conn.WriteMessage(1,raw); err != nil {
				log.Printf("Write error for client in room %s: %v",r.RoomID,err)
				client.Conn.Close()
				delete(r.Clients,client)
			}
		}
		r.mu.Unlock()
	}

	// for {
	// 	message := <-r.Broadcast
	// 	for client := range r.Clients {
	// 		err := client.Conn.WriteMessage(1,message,)
	// 		if err != nil {
	// 			client.Conn.Close()
	// 			delete(r.Clients, client)
	// 		}
	// 	}
	// }

}

func (r *RuntimeRoom) broadcastPresence() {
	r.mu.Lock()
	users := make([]string, 0)
	seen := map[string]bool{}
	for c := range r.Clients {
		if c.UserID != "" && !seen[c.UserID] {
			users = append(users, c.UserID)
			seen[c.UserID] = true
		}
	}
	r.mu.Unlock()
	msg := PresenceMessage{Type: EventPresence, Users: users}
	data, _ := json.Marshal(msg)
	r.mu.Lock()
	for client := range r.Clients {
		client.Conn.WriteMessage(1, data)
	}
	r.mu.Unlock()
}

func (r *RuntimeRoom) SendChatHistory(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, msg := range r.ChatHistory {
		data, err := json.Marshal(msg)
		if err == nil {
			c.Conn.WriteMessage(1, data)
		}
	}
}

func (r *RuntimeRoom) HandleChat(msg ChatMessage) {
	msg.Timestamp = time.Now().UnixMilli()
	r.mu.Lock()
	r.ChatHistory = append(r.ChatHistory, msg)
	r.mu.Unlock()
	data, _ := json.Marshal(msg)
	r.mu.Lock()
	for client := range r.Clients {
		client.Conn.WriteMessage(1, data)
	}
	r.mu.Unlock()
}

func (r *RuntimeRoom) CleanupIfEmpty() {
	r.mu.Lock()
	empty := len(r.Clients) == 0
	r.mu.Unlock()

	if empty {
		delete(ActiveRooms,r.RoomID)
		close(r.Broadcast)
		log.Printf("Room %s deleted (no user)", r.RoomID)
	}
}

func (r *RuntimeRoom) SendHistory(c *Client) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if len(r.History) == 0 {
		return
	}
	sync := SyncMessage{
		Type: EventSync,
		Events: r.History,
	}

	data, err := json.Marshal(sync)
	if err != nil {
		return
	}
	c.Conn.WriteMessage(1,data)
}