package websocket

const (
	EventDraw 		= "draw"
	EventClear		= "clear"
	EventBegin 		= "begin"
	EventSync		= "sync"
)

type DrawEvent struct {
	Type 		string		`json:"type"`
	X			float64		`json:"x,omitempty"`
	Y			float64		`json:"y,omitempty"`
	PrevX		float64		`json:"prevX,omitempty"`
	PrevY		float64		`json:"prevY,omitempty"`
	Color		string		`json:"color,omitempty"`
	Size		float64		`json:"size,omitempty"`
	UserID		string		`json:"userId,omitempty"`
}

type SyncMessage struct {
	Type		string			`json:"type"`
	Events		[]DrawEvent		`json:"events"`
}