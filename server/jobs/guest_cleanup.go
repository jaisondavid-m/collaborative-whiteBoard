package jobs

import (

	"log"
	"time"

	"gorm.io/gorm"

	"server/config"
	"server/models"
	
)

const guestInactivityWindow = 7 * 24 * time.Hour

func CleanupInactiveGuests() {

	cutoff := time.Now().Add(-guestInactivityWindow)

	var staleGuests []models.User

	if err := config.DB.Where(
		"is_guest = ? AND is_deleted = ? AND last_active_at < ?",
		true, false, cutoff,
	).Find(&staleGuests).Error; err != nil {
		log.Printf("guest cleanup: failed to fetch stale guests: %v", err)
		return
	}

	for _, u := range staleGuests {
		if err := deleteUserAndData(u.UserID); err != nil {
			log.Printf("guest cleanup: failed to delete %s: %v\n", u.UserID, err)
			continue
		}
		log.Printf("guest cleanup: deleted inactive guest %s\n", u.UserID)
	}

}


func deleteUserAndData(userID string) error {

	return config.DB.Transaction(func(tx *gorm.DB) error {

		// deleting friend request including sent and receive
		if err := tx.Where("sender_id = ? OR receiver_id = ?", userID, userID).
			Delete(&models.FriendRequest{}).Error; err != nil {
			return err
		}

		// deleting friendships
		if err := tx.Where("user1_id = ? OR user2_id = ?", userID, userID).
			Delete(&models.Friendship{}).Error; err != nil {
			return err
		}

		// deleting blocks in both
		if err := tx.Where("sender_id = ? OR receiver_id = ?", userID, userID).
			Delete(&models.Block{}).Error; err != nil {
			return err
		}

		// deleting conversation
		if err := tx.Where("user1_id = ? OR user2_id = ?", userID, userID).
			Delete(&models.Conversation{}).Error; err != nil {
			return err
		}

		// deleting notification sent or received
		if err := tx.Where("sender_id = ? OR recipient_id = ?", userID, userID).
			Delete(&models.Notification{}).Error; err != nil {
			return err
		}

		// deleting uservisits data
		if err := tx.Where("user_id = ?", userID).
			Delete(&models.UserVisit{}).Error; err != nil {
			return err
		}

		//Finally deleting the user itself - auto delete guest account
		if err := tx.Unscoped().Where("user_id = ?", userID).
			Delete(&models.User{}).Error; err != nil {
			return err
		}

		return nil

	})

}