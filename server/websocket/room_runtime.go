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
	cleanupTimer *time.Timer
}

// func (r *RuntimeRoom) AddClient(c *Client) {
// 	r.mu.Lock()
// 	r.Clients[c] = true
// 	if r.cleanupTimer != nil {
// 		r.cleanupTimer.Stop()
// 		r.cleanupTimer = nil
// 	}
// 	r.mu.Unlock()
// 	r.broadcastPresence()
// }

func NewRuntimeRoom(roomID string) *RuntimeRoom {

	room := &RuntimeRoom{
		RoomID: roomID,
		Clients: make(map[*Client]bool),
		Broadcast: make(chan []byte, 256),
		History: []DrawEvent{},
		ChatHistory: []ChatMessage{},
	}

	go room.Run()

	return room

}

func (r *RuntimeRoom) Run() {

	for raw := range r.Broadcast {
		r.mu.Lock()
		clients := make([]*Client, 0, len(r.Clients))
		for client := range r.Clients {
			clients = append(clients, client)
			// if err := client.Conn.WriteMessage(1,raw); err != nil {
			// 	log.Printf("Write error for client in room %s: %v",r.RoomID,err)
			// 	client.Conn.Close()
			// 	delete(r.Clients,client)
			// }
		}
		r.mu.Unlock()
		for _, client := range clients {
			select {
			case client.Send <- raw:
			default:
				log.Printf(
					"Client send buffer full in room %s for user %s",
					r.RoomID,
					client.UserID,
				)
				r.RemoveClient(client)
			}
		}
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

	// r.mu.Unlock()
	msg := PresenceMessage{Type: EventPresence, Users: users}

	data, err := json.Marshal(msg)
	if err != nil {
		r.mu.Unlock()
		return 
	}

	// r.mu.Lock()

	for client := range r.Clients {
		select {
		case client.Send <- data:
		default:
			log.Printf("Presence buffer full for client %s",client.UserID)
		}
		// client.Conn.WriteMessage(1, data)
	}

	r.mu.Unlock()
}

func (r *RuntimeRoom) SendChatHistory(c *Client) {
	r.mu.Lock()
	messages := append([]ChatMessage(nil), r.ChatHistory...)
	r.mu.Unlock()

	for _, msg := range messages {
		data, err := json.Marshal(msg)
		if err != nil {
			// c.Conn.WriteMessage(1, data)
			continue
		}

		select {
		case c.Send <- data:
		default:
			log.Printf("Chat history buffer full for client %s",c.UserID)
			return 
		}
	}
}

func (r *RuntimeRoom) HandleChat(msg ChatMessage) {
	msg.Timestamp = time.Now().UnixMilli()

	data, err := json.Marshal(msg)
	if err != nil {
		return 
	}

	r.mu.Lock()
	r.ChatHistory = append(r.ChatHistory, msg)

	// r.mu.Unlock()
	// data, _ := json.Marshal(msg)
	// r.mu.Lock()

	for client := range r.Clients {
		// client.Conn.WriteMessage(1, data)
		select {
		case client.Send <- data:
		default:
			log.Printf("Chat buffer full for client %s",client.UserID)
		}
	}
	r.mu.Unlock()
}

func (r *RuntimeRoom) CleanupIfEmpty() {

	r.mu.Lock()

	if len(r.Clients) != 0 {
		r.mu.Unlock()
		return 
	}
	
	// defer r.mu.Unlock()

	// empty := len(r.Clients)

	// if empty != 0 {
	// 	return 
	// }

	if r.cleanupTimer != nil {
		r.mu.Unlock()
		return
	}

	// if empty {
	// 	DeleteRoom(r.RoomID)
	// 	// delete(ActiveRooms,r.RoomID)
	// 	close(r.Broadcast)
	// 	log.Printf("Room %s deleted (no user)", r.RoomID)
	// }

	r.cleanupTimer = time.AfterFunc(30*time.Second, func() {

		activeRoomsMu.Lock()

		// defer activeRoomsMu.Unlock()

		if ActiveRooms[r.RoomID] == r {
			delete(ActiveRooms,r.RoomID)
			// close(r.Broadcast)-
			log.Printf("Room %s deleted (no user)", r.RoomID)
		}

		activeRoomsMu.Unlock()

		r.mu.Lock()
		r.cleanupTimer = nil
		r.mu.Unlock()

	})

	r.mu.Unlock()
}

func (r *RuntimeRoom) SendHistory(c *Client) {

	r.mu.Lock()

	// defer r.mu.Unlock()

	if len(r.History) == 0 {
		r.mu.Unlock()
		return
	}

	sync := SyncMessage{
		Type: EventSync,
		Events: append([]DrawEvent(nil), r.History...),
	}

	r.mu.Unlock()

	data, err := json.Marshal(sync)
	if err != nil {
		return
	}

	select {
	case c.Send <- data:
	default:
		log.Printf("History Buffer full for client %s",c.UserID)
	}

	// c.Conn.WriteMessage(1,data)
}

func (r *RuntimeRoom) RemoveClient(c *Client) {

	r.mu.Lock()

	if _, exists := r.Clients[c]; !exists {
		r.mu.Unlock()
		return 
	}

	delete(r.Clients, c)

	// close(c.Send)
	// c.Conn.Close()

	r.mu.Unlock()

	c.Conn.Close()

	r.broadcastPresence()
	r.CleanupIfEmpty()

}