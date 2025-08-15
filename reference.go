package routes

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// Структура запроса для обновления reference статуса
type UpdateReferenceRequest struct {
	ID          int64  `json:"id"`          // ID записи
	IsReference bool   `json:"isReference"` // Новый статус
}

// Структура ответа
type ReferenceResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	ID      int64  `json:"id,omitempty"`
}

// updateReferenceStatus - обновляет поле is_reference для записи
func (h *handler) updateReferenceStatus(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var req UpdateReferenceRequest
	
	// Декодируем JSON запрос
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ReferenceResponse{
			Success: false,
			Message: fmt.Sprintf("Ошибка декодирования запроса: %v", err),
		})
		return
	}
	
	// Проверяем, что ID указан
	if req.ID <= 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ReferenceResponse{
			Success: false,
			Message: "ID записи должен быть больше 0",
		})
		return
	}
	
	// Обновляем поле is_reference
	result := h.remoteDB.Model(&Click{}).
		Where("id = ?", req.ID).
		Update("is_reference", req.IsReference)
	
	if result.Error != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ReferenceResponse{
			Success: false,
			Message: fmt.Sprintf("Ошибка обновления записи: %v", result.Error),
		})
		return
	}
	
	if result.RowsAffected == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(ReferenceResponse{
			Success: false,
			Message: fmt.Sprintf("Запись с ID %d не найдена", req.ID),
		})
		return
	}
	
	// Логируем изменение
	h.logger.Infof("Reference status updated: ID=%d, IsReference=%v", req.ID, req.IsReference)
	
	// Отправляем успешный ответ
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(ReferenceResponse{
		Success: true,
		Message: fmt.Sprintf("Статус reference успешно обновлен для записи ID=%d", req.ID),
		ID:      req.ID,
	})
}

// getReferenceClicks - получает все эталонные записи
func (h *handler) getReferenceClicks(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var clicks []Click
	
	// Получаем только эталонные записи
	if err := h.remoteDB.Where("is_reference = ?", true).
		Order("id DESC").
		Find(&clicks).Error; err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": fmt.Sprintf("Ошибка получения данных: %v", err),
		})
		return
	}
	
	// Отправляем результат
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"total":   len(clicks),
		"data":    clicks,
	})
}