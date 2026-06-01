package models

type RegisterInput struct {
	UserID 			string 		`json:"userid" binding:"required,min=4,max=30"`
	Password 		string 		`json:"password" binding:"required,min=8,max=64"`
}

type UpdateRoleInput struct {
	UserID			string		`json:"userid"`
	Role			string		`json:"role"`
}

type GoogleLoginRequest struct {
	Token string `json:"token" binding:"required" `
}