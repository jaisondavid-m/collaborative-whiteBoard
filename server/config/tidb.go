package config

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"log"
	"os"
	"time"

	"server/models"

	"github.com/go-sql-driver/mysql"
	gormMysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var TiDB *gorm.DB

func ConnectTiDB() {

	username := os.Getenv("TIDB_USERNAME")
	password := os.Getenv("TIDB_PASSWORD")
	host := os.Getenv("TIDB_HOST")
	port := os.Getenv("TIDB_PORT")
	dbname := os.Getenv("TIDB_DATABASE")
	caPath := os.Getenv("TIDB_CA_PATH")

	if err := registerTiDBTLSconfig(caPath); err != nil {
		log.Fatalf("Failed to register TiDB TLS config: %v", err)
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local&tls=tidb",
		username,
		password,
		host,
		port,
		dbname,
	)

	database, err := gorm.Open(
		gormMysql.Open(dsn), 
		&gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		},
	)

	if err != nil {
		log.Fatalf("TiDB connection Failed: %v",err)
	}

	sqlDB, err := database.DB()

	if err != nil {
		log.Fatalf("Failed to get generic DB object: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetConnMaxLifetime(30*time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	DB = database
	TiDB = database

	// if err != nil {
	// 	log.Fatalf("TiDB connection Failed: %v", err)
	// }

	// TiDB = database

	err = TiDB.AutoMigrate(
		&models.User{},
		&models.Room{},
		&models.AuditLog{},
		&models.Notification{},
		&models.Message{},
		&models.Conversation{},
		&models.FriendRequest{},
		&models.Friendship{},
		&models.Block{},
		&models.UserVisit{},
	)

	if err != nil {
		log.Fatalf("TiDB Migration Failed: %v", err)
	}

	fmt.Println("TiDB connected")

}

func registerTiDBTLSconfig(caPath string) error {

	rootCertPool := x509.NewCertPool()

	pem, err := os.ReadFile(caPath)

	if err != nil {
		return fmt.Errorf("failed to read CA cert at %s: %w", caPath, err)
	}

	if ok := rootCertPool.AppendCertsFromPEM(pem); !ok {
		return fmt.Errorf("failed to append CA cert from %s", caPath)
	}

	return mysql.RegisterTLSConfig("tidb", &tls.Config{
		RootCAs: rootCertPool,
		MinVersion: tls.VersionTLS12,
	})

}