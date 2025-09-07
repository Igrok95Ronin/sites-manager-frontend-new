package routes

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/Igrok95Ronin/advertising-templates/pkg/httperror"
	"github.com/julienschmidt/httprouter"
)

// RequestData представляет структуру данных, отправляемых из React
type RequestData struct {
	StartDate              string `json:"startDate"`              // Дата начала в формате yyyy-MM-dd
	EndDate                string `json:"endDate"`                // Дата окончания в формате yyyy-MM-dd
	Domain                 string `json:"domain"`                 // Домен
	Limit                  string `json:"limit"`                  // Лимит записей
	ID                     bool   `json:"id"`                     // Поле "ID"
	CreatedAt              bool   `json:"createdAt"`              // Поле "Created At"
	GCLID                  bool   `json:"gclid"`                  // Поле "GCLID"
	Host                   bool   `json:"host"`                   // Поле "Host"
	IP                     bool   `json:"IP"`                     // Поле "IP"
	Headers                bool   `json:"headers"`                // Поле "Headers"
	JSData                 bool   `json:"jsData"`                 // Поле "JS Data"
	TimeSpent              bool   `json:"timeSpent"`              // Поле "Time Spent"
	ClickCoordinates       bool   `json:"clickCoordinates"`       // Поле "Click Coordinates"
	ScrollCoordinates      bool   `json:"scrollCoordinates"`      // Поле "Scroll Coordinates"
	ClickOnNumber          bool   `json:"clickOnNumber"`          // Поле "Click On Number"
	ClickOnInvisibleNumber bool   `json:"clickOnInvisibleNumber"` // Поле "Click On Invisible Number"
	AccountID              bool   `json:"accountID"`              // Поле "Account ID"
	CompanyID              bool   `json:"companyID"`              // Поле "Company ID"
	Keyword                bool   `json:"keyword"`                // Поле "Keyword"
	Device                 bool   `json:"device"`                 // Поле "Device"
	IsChecked              bool   `json:"isChecked"`              // Поле "Is Checked"
	StorageQuota           bool   `json:"storageQuota"`           // Поле "Storage Quota"
	Fingerprint            bool   `json:"fingerprint"`            // Отпечаток Браузера
	IsFirstVisit           bool   `json:"isFirstVisit"`           // Поле "Is First Visit"
	ClickCallType          bool   `json:"clickCallType"`          // Поле "Click Call Type"
	HadTouchBeforeScroll   bool   `json:"hadTouchBeforeScroll"`   // Поле "Had Touch Before Scroll"
	MotionDataRaw          bool   `json:"motionDataRaw"`          // Поле "Motion Data Raw"
	IsReference            bool   `json:"isReference"`            // Поле "Is Reference"
}

// Скачать файл
func (h *handler) downloadFileLogsADS(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var requestData RequestData

	if err := json.NewDecoder(r.Body).Decode(&requestData); err != nil {
		httperror.WriteJSONError(w, "Ошибка декодирования JSON", err, http.StatusBadRequest)
		h.logger.Errorf("Ошибка декодирования JSON: %s", err)
		return
	}

	// HTTP-запрос для загрузки CSV файла
	downloadCSV(h, w, requestData)
}

// HTTP-запрос для загрузки CSV файла
func downloadCSV(h *handler, w http.ResponseWriter, requestData RequestData) {
	// Устанавливаем заголовок Content-Type с указанием кодировки UTF-8
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", "attachment;filename=data.csv")

	// Создаем буфер для записи данных
	var buffer bytes.Buffer

	// Добавляем BOM в начало буфера
	buffer.Write([]byte("\xEF\xBB\xBF"))

	// Создаем CSV writer, который будет записывать данные в буфер
	writer := csv.NewWriter(&buffer)

	// Создаем запрос к базе данных
	dbQuery := h.remoteDB.Where("domain = ? AND DATE(created_at) BETWEEN ? AND ?", requestData.Domain, requestData.StartDate, requestData.EndDate)

	// Обработка лимита
	if requestData.Limit != "" {
		limitValue, err := strconv.Atoi(requestData.Limit)
		if err != nil {
			// Если ошибка преобразования, возвращаем ошибку
			http.Error(w, "Некорректное значение лимита", http.StatusBadRequest)
			h.logger.Errorf("Некорректное значение лимита: %s", err)
			return
		}
		if limitValue > 0 {
			dbQuery = dbQuery.Limit(limitValue)
		}
	}

	// Получаем данные из базы данных
	var clicks []Click
	if err := dbQuery.Find(&clicks).Error; err != nil {
		http.Error(w, "Ошибка при получении данных из базы данных", http.StatusInternalServerError)
		h.logger.Errorf("Ошибка при получении данных из базы данных: %s", err)
		return
	}

	// Проверяем, есть ли данные для экспорта
	if len(clicks) == 0 {
		http.Error(w, "Нет данных для экспорта", http.StatusNotFound)
		return
	}

	// Создаем заголовки на основе полей, выбранных пользователем
	var headers []string

	headers = append(headers, "Domain")

	if requestData.ID {
		headers = append(headers, "ID")
	}
	if requestData.CreatedAt {
		headers = append(headers, "Created At")
	}
	if requestData.GCLID {
		headers = append(headers, "GCLID")
	}
	if requestData.Host {
		headers = append(headers, "Host")
	}
	if requestData.IP {
		headers = append(headers, "IP")
	}
	if requestData.Headers {
		headers = append(headers, "Headers")
	}
	if requestData.JSData {
		headers = append(headers, "JS Data")
	}
	if requestData.TimeSpent {
		headers = append(headers, "Time Spent")
	}
	if requestData.ClickCoordinates {
		headers = append(headers, "Click Coordinates")
	}
	if requestData.ScrollCoordinates {
		headers = append(headers, "Scroll Coordinates")
	}
	if requestData.ClickOnNumber {
		headers = append(headers, "Click On Number")
	}
	if requestData.ClickOnInvisibleNumber {
		headers = append(headers, "Click On Invisible Number")
	}
	if requestData.AccountID {
		headers = append(headers, "Account ID")
	}
	if requestData.CompanyID {
		headers = append(headers, "Company ID")
	}
	if requestData.Keyword {
		headers = append(headers, "Keyword")
	}
	if requestData.Device {
		headers = append(headers, "Device")
	}
	if requestData.IsChecked {
		headers = append(headers, "Suspicious traffic")
	}
	if requestData.StorageQuota {
		headers = append(headers, "Storage Quota")
	}
	if requestData.Fingerprint {
		headers = append(headers, "Browser fingerprint")
	}
	if requestData.IsFirstVisit {
		headers = append(headers, "Is First Visit")
	}
	if requestData.ClickCallType {
		headers = append(headers, "Click Call Type")
	}
	if requestData.HadTouchBeforeScroll {
		headers = append(headers, "Had Touch Before Scroll")
	}
	if requestData.MotionDataRaw {
		headers = append(headers, "Motion Data Raw")
	}
	if requestData.IsReference {
		headers = append(headers, "Is Reference")
	}

	// Проверяем, выбрано ли хотя бы одно поле
	if len(headers) == 0 {
		http.Error(w, "Не выбрано ни одного поля для экспорта", http.StatusBadRequest)
		return
	}

	// Записываем заголовки в CSV
	if err := writer.Write(headers); err != nil {
		http.Error(w, "Ошибка при записи заголовков CSV файла", http.StatusInternalServerError)
		return
	}

	// Проходим по всем записям и записываем их в CSV файл
	for _, click := range clicks {
		var record []string

		record = append(record, click.Domain)

		if requestData.ID {
			record = append(record, fmt.Sprintf("%d", click.ID))
		}
		if requestData.CreatedAt {
			record = append(record, click.CreatedAt.Format("2006-01-02 15:04:05"))
		}
		if requestData.GCLID {
			record = append(record, click.Gclid)
		}
		if requestData.Host {
			record = append(record, click.Host)
		}
		if requestData.IP {
			record = append(record, click.IP)
		}
		if requestData.Headers {
			record = append(record, click.Headers)
		}
		if requestData.JSData {
			record = append(record, click.JsData)
		}
		if requestData.TimeSpent {
			record = append(record, click.TimeSpent)
		}
		if requestData.ClickCoordinates {
			record = append(record, click.ClickCoordinates)
		}
		if requestData.ScrollCoordinates {
			record = append(record, click.ScrollCoordinates)
		}
		if requestData.ClickOnNumber {
			record = append(record, fmt.Sprintf("%v", click.ClickOnNumber))
		}
		if requestData.ClickOnInvisibleNumber {
			record = append(record, fmt.Sprintf("%v", click.ClickOnInvisibleNumber))
		}
		if requestData.AccountID {
			record = append(record, click.AccountID)
		}
		if requestData.CompanyID {
			record = append(record, click.CompanyID)
		}
		if requestData.Keyword {
			record = append(record, click.Keyword)
		}
		if requestData.Device {
			record = append(record, click.Device)
		}
		if requestData.IsChecked {
			record = append(record, fmt.Sprintf("%v", click.IsChecked))
		}
		if requestData.StorageQuota {
			record = append(record, fmt.Sprintf("%d", click.StorageQuota))
		}
		if requestData.Fingerprint {
			record = append(record, click.Fingerprint)
		}
		if requestData.IsFirstVisit {
			record = append(record, fmt.Sprintf("%v", click.IsFirstVisit))
		}
		if requestData.ClickCallType {
			record = append(record, click.ClickCallType)
		}
		if requestData.HadTouchBeforeScroll {
			if click.HadTouchBeforeScroll != nil {
				record = append(record, fmt.Sprintf("%v", *click.HadTouchBeforeScroll))
			} else {
				record = append(record, "")
			}
		}
		if requestData.MotionDataRaw {
			record = append(record, click.MotionDataRaw)
		}
		if requestData.IsReference {
			record = append(record, fmt.Sprintf("%v", click.IsReference))
		}

		// Записываем строку в CSV
		if err := writer.Write(record); err != nil {
			http.Error(w, "Ошибка при записи CSV файла", http.StatusInternalServerError)
			return
		}
	}

	// Убеждаемся, что все буферизованные операции записи завершены
	writer.Flush()

	// Проверяем наличие ошибок после Flush
	if err := writer.Error(); err != nil {
		http.Error(w, "Ошибка при записи CSV файла", http.StatusInternalServerError)
		return
	}

	// Пишем содержимое буфера в ответ
	_, err := w.Write(buffer.Bytes())
	if err != nil {
		http.Error(w, "Ошибка при отправке CSV файла", http.StatusInternalServerError)
		return
	}
}
