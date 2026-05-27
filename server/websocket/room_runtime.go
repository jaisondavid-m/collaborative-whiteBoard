package websocket

type RuntimeRoom struct {
	RoomID		string
	Clients		map[*Client]bool
	Broadcast	chan []byte
}

func NewRuntimeRoom(roomID string) *RuntimeRoom {

	room := &RuntimeRoom{
		RoomID: roomID,
		Clients: make(map[*Client]bool),
		Broadcast: make(chan []byte),
	}

	go room.Run()

	return room

}

func (r *RuntimeRoom) Run() {

	for {
		message := <-r.Broadcast
		for client := range r.Clients {
			err := client.Conn.WriteMessage(1,message,)
			if err != nil {
				client.Conn.Close()
				delete(r.Clients, client)
			}
		}
	}

}