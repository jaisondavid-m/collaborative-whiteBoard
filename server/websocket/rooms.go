package websocket

import "sync"

var (
	ActiveRooms  = make(map[string]*RuntimeRoom)
	activeRoomsMu sync.Mutex
)

func GetOrCreateRoom(roomID string) *RuntimeRoom {

	activeRoomsMu.Lock()
	defer activeRoomsMu.Unlock()

	if room, exists := ActiveRooms[roomID]; exists {
		return room
	}

	room := NewRuntimeRoom(roomID)
	ActiveRooms[roomID] = room

	return room

}

func DeleteRoom(roomID string) {

	activeRoomsMu.Lock()
	defer activeRoomsMu.Unlock()
	delete(ActiveRooms, roomID)

}

func GetRoom(roomID string) (*RuntimeRoom, bool) {

	activeRoomsMu.Lock()
	defer activeRoomsMu.Unlock()
	room, ok := ActiveRooms[roomID]
	return room, ok

}