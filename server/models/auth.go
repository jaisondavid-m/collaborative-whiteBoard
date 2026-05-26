package models

type RegisterInput struct {
	UserID 			string 		`json:"userid"`
	Password 		string 		`json:"password"`
}