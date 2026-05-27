package websocket

var ActiveRooms = make(
	map[string]*RuntimeRoom,
)