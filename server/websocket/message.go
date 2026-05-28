package websocket

const (
	EventDraw 		= "draw"
	EventClear		= "clear"
	EventBegin 		= "begin"
	EventShape 		= "shape"

	EventSync		= "sync"
	EventChat 		= "chat"
	EventPresence	= "presence"
)

type DrawEvent struct {
	Type 		string		`json:"type"`

	X			float64		`json:"x,omitempty"`
	Y			float64		`json:"y,omitempty"`

	PrevX		float64		`json:"prevX,omitempty"`
	PrevY		float64		`json:"prevY,omitempty"`

	StartX		float64 	`json:"startX,omitempty"`
	StartY		float64		`json:"startY,omitempty"`

	Color		string		`json:"color,omitempty"`
	Size		float64		`json:"size,omitempty"`

	Tool		string		`json:"tool,omitempty"`

	UserID		string		`json:"userId,omitempty"`
}

type SyncMessage struct {
	Type		string			`json:"type"`
	Events		[]DrawEvent		`json:"events"`
}

type ChatMessage struct {
	Type		string			`json:"type"`
	UserID		string			`json:"userId"`
	Text		string			`json:"text"`
	Timestamp	int64			`json:"timestamp"`
}

type PresenceMessage struct {
	Type 		string			`json:"type"`
	Users		[]string		`json:"users"`
}