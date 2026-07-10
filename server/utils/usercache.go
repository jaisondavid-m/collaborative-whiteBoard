package utils

import (

	"server/cache"
	"server/config"
	"server/models"

)

func GetActiveUser(userID string) (*models.User, error) {

	if v, found := cache.C.Get(cache.UserKey(userID)); found {
		return v.(*models.User), nil
	}

	var user models.User

	if err := config.DB.Where(
		"user_id = ? AND is_deleted = ? AND is_blocked = ?",
		userID, false, false,
	).First(&user).Error; err != nil {
		return nil, err
	}

	cache.C.Set(cache.UserKey(userID), &user, 0)

	return &user, nil

}