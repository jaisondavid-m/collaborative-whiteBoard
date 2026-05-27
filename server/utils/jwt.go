package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("secretkeysecretkey")

func GenerateJWT(userid string) (string, error) {

	claims := jwt.MapClaims{
		"userid":userid,
		"exp":time.Now().Add(time.Hour*3).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256,claims)

	tokenString, err := token.SignedString(jwtSecret)

	if err != nil {
		return "", err
	}

	return tokenString, nil

}

func VerifyJWT(tokenString string) (*jwt.Token, error) {

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	return token, nil

}

func ExtractClaims(token *jwt.Token) (string, bool) {
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", false
	}
	uid, ok := claims["userid"].(string)
	return uid, ok
}