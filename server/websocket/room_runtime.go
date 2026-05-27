package websocket

import (
	"encoding/json"
	"log"
	"sync"
)

type RuntimeRoom struct {
	RoomID		string
	Clients		map[*Client]bool
	Broadcast	chan []byte
	mu			sync.Mutex
	History		[]DrawEvent
}

func (r *RuntimeRoom) AddClient(c *Client) {
	r.mu.Lock()
	r.Clients[c] = true
	r.mu.Unlock()
}

func NewRuntimeRoom(roomID string) *RuntimeRoom {

	room := &RuntimeRoom{
		RoomID: roomID,
		Clients: make(map[*Client]bool),
		Broadcast: make(chan []byte),
		History: []DrawEvent{},
	}

	go room.Run()

	return room

}

func (r *RuntimeRoom) Run() {

	for raw := range r.Broadcast {

		var event DrawEvent
		if err := json.Unmarshal(raw, &event); err == nil {
			r.mu.Lock()
			if event.Type == EventClear {
				r.History = []DrawEvent{}
			} else if event.Type == EventDraw || event.Type == EventBegin {
				r.History = append(r.History, event)
			}
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