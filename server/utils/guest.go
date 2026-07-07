package utils

import (

	"fmt"
	"crypto/rand"
	
)

func GenerateGuestID() (string, error) {

	b := make([]byte, 4)

	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return fmt.Sprintf("guest_%x", b), nil

}