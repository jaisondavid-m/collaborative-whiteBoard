package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

const (
	MaxImageSize = 5 << 20 //max 5mb
	UploadDir = "./uploads/images"
)

var allowedImageExts = map[string]bool{
	".jpg": true,
	".jpeg": true,
	".png": true,
	".gif": true,
	".webp": true,
}

func SaveImageFile(fileHeader *multipart.FileHeader) (string, error) {

	if fileHeader.Size > MaxImageSize {
		return "", fmt.Errorf("file too large (max %d MB)", MaxImageSize/(1<<20))
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))

	if !allowedImageExts[ext] {
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}

	if err := os.MkdirAll(UploadDir, 0755); err != nil {
		return "", err
	}

	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), uuid.NewString(), ext)

	dstPath := filepath.Join(UploadDir, filename)

	src, err := fileHeader.Open()

	if err != nil {
		return "", err
	}

	defer src.Close()

	dst, err := os.Create(dstPath)

	if err != nil {
		return "", err
	}

	defer dst.Close()

	buf := make([]byte, 512*1024)
	for {
		n, readErr := src.Read(buf)
		if n > 0 {
			if _, writeErr := dst.Write(buf[:n]); writeErr != nil {
				return "", writeErr
			}
		}
		if readErr != nil {
			break
		}
	}

	return "/uploads/images/" + filename, nil

}