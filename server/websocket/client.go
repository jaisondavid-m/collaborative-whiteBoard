package websocket

import "github.com/gorilla/websocket"

type Client struct {
	Conn *websocket.Conn
	Room *RuntimeRoom
}

func (c *Client) ReadMessages() {

	defer func ()  {
		c.Conn.Close()
		delete(c.Room.Clients,c)
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
		c.Room.Broadcast <- message
	}

}