package routes

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"github.com/julienschmidt/httprouter"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Структура для параметров запроса (расширяемая для будущих полей)
type BotAnalysisParams struct {
	StartDate *time.Time `json:"startDate,omitempty"`
	EndDate   *time.Time `json:"endDate,omitempty"`
	Domain    string     `json:"domain,omitempty"`
	Limit     int        `json:"limit,omitempty"`
	Offset    int        `json:"offset,omitempty"`
	// Дополнительные поля для будущего анализа
	AccountID string                 `json:"accountId,omitempty"`
	CompanyID string                 `json:"companyId,omitempty"`
	IP        string                 `json:"ip,omitempty"`
	Device    string                 `json:"device,omitempty"`
	Keyword   string                 `json:"keyword,omitempty"`
	Filters   map[string]interface{} `json:"filters,omitempty"` // Для произвольных фильтров
}

// Структура для результата анализа бота
type BotAnalysisResult struct {
	Click
	BotScore         int            `json:"bot_score"`
	BotStatus        string         `json:"bot_status"`         // BOT, PROBABLE_BOT, SUSPICIOUS, HUMAN
	BotProbability   float64        `json:"bot_probability"`    // Вероятность в процентах
	BotIndicators    []BotIndicator `json:"bot_indicators"`     // Индикаторы, которые сработали
	AllCheckedParams []BotIndicator `json:"all_checked_params"` // ВСЕ проверенные параметры
	TotalChecks      int            `json:"total_checks"`       // Общее количество проверок
	TriggeredChecks  int            `json:"triggered_checks"`   // Количество сработавших проверок
	AnalysisReport   string         `json:"analysis_report"`    // Детальный отчет для Google
}

// Индикатор бота с объяснением
type BotIndicator struct {
	Name                string `json:"name"`                           // Название критерия
	Score               int    `json:"score"`                          // Баллы за критерий
	Category            string `json:"category"`                       // CRITICAL, HIGH, MEDIUM, LOW
	Description         string `json:"description"`                    // Описание почему это индикатор бота
	Value               string `json:"value"`                          // Фактическое значение
	Expected            string `json:"expected"`                       // Ожидаемое значение для человека
	Triggered           bool   `json:"triggered"`                      // Сработал ли индикатор
	Checked             bool   `json:"checked"`                        // Был ли параметр проверен
	DetailedExplanation string `json:"detailed_explanation,omitempty"` // Подробное объяснение со всеми вариациями
}

// Анализ бота - поддерживает как GET с параметрами, так и POST с JSON
func (h *handler) botAnalysis(w http.ResponseWriter, r *http.Request, p httprouter.Params) {
	var params BotAnalysisParams
	var err error

	// Определяем источник параметров по методу запроса
	if r.Method == "POST" {
		// Для POST запроса читаем JSON из тела
		if r.Body == nil {
			http.Error(w, "Пустое тело запроса", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		err = json.NewDecoder(r.Body).Decode(&params)
		if err != nil {
			h.logger.Error("Ошибка парсинга JSON: ", err)
			http.Error(w, fmt.Sprintf("Неверный формат JSON: %v", err), http.StatusBadRequest)
			return
		}
	} else {
		// Для GET запроса используем URL параметры
		urlParams, err := parseBotAnalysisParams(r)
		if err != nil {
			h.logger.Error("Ошибка парсинга параметров: ", err)
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		params = *urlParams
	}

	// Устанавливаем значения по умолчанию
	if params.Limit <= 0 {
		params.Limit = 30
	}
	if params.Limit > 2000 {
		params.Limit = 2000
	}
	if params.Offset < 0 {
		params.Offset = 0
	}

	// Получить все данные из бд с учетом фильтрации
	clicks, err := getAllDataFromDBForBotAnalysis(h, w, &params)
	if err != nil {
		h.logger.Error("Ошибка получения данных: ", err)
		return
	}

	// Логируем количество полученных записей
	h.logger.Infof("Получено записей: %d, Метод: %s, Параметры: domain=%s, limit=%d, offset=%d",
		len(clicks), r.Method, params.Domain, params.Limit, params.Offset)

	// Анализируем клики на предмет ботов
	analyzedClicks := analyzeClicksForBots(h, clicks)

	// Возвращаем результат с анализом
	response := map[string]interface{}{
		"total":   len(analyzedClicks),
		"limit":   params.Limit,
		"offset":  params.Offset,
		"filters": params,
		"data":    analyzedClicks,
	}

	// Преобразование данных в JSON
	w.Header().Set("Content-Type", "application/json")
	if err = json.NewEncoder(w).Encode(response); err != nil {
		h.logger.Error("Ошибка кодирования JSON: ", err)
		http.Error(w, "Ошибка при кодировании данных в JSON", http.StatusInternalServerError)
		return
	}
}

// Парсинг параметров запроса
func parseBotAnalysisParams(r *http.Request) (*BotAnalysisParams, error) {
	params := &BotAnalysisParams{
		Limit:  30, // значение по умолчанию
		Offset: 0,  // значение по умолчанию
	}

	// Парсим limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		limit, err := strconv.Atoi(limitStr)
		if err != nil || limit < 1 {
			return nil, fmt.Errorf("неверное значение limit: %s", limitStr)
		}
		if limit > 1000 {
			limit = 1000 // максимум 1000 записей за раз
		}
		params.Limit = limit
	}

	// Парсим offset
	if offsetStr := r.URL.Query().Get("offset"); offsetStr != "" {
		offset, err := strconv.Atoi(offsetStr)
		if err != nil || offset < 0 {
			return nil, fmt.Errorf("неверное значение offset: %s", offsetStr)
		}
		params.Offset = offset
	}

	// Парсим domain
	if domain := r.URL.Query().Get("domain"); domain != "" {
		params.Domain = strings.TrimSpace(domain)
	}

	// Парсим startDate
	if startDateStr := r.URL.Query().Get("startDate"); startDateStr != "" {
		startDate, err := time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			// Пробуем другой формат
			startDate, err = time.Parse("2006-01-02", startDateStr)
			if err != nil {
				return nil, fmt.Errorf("неверный формат startDate: %s", startDateStr)
			}
		}
		params.StartDate = &startDate
	}

	// Парсим endDate
	if endDateStr := r.URL.Query().Get("endDate"); endDateStr != "" {
		endDate, err := time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			// Пробуем другой формат
			endDate, err = time.Parse("2006-01-02", endDateStr)
			if err != nil {
				return nil, fmt.Errorf("неверный формат endDate: %s", endDateStr)
			}
		}
		params.EndDate = &endDate
	}

	return params, nil
}

// Получить все данные из бд с учетом фильтрации
func getAllDataFromDBForBotAnalysis(h *handler, w http.ResponseWriter, params *BotAnalysisParams) ([]Click, error) {
	// Создание слайса для хранения всех записей
	var clicks []Click

	// Создаем запрос к базе данных
	dbQuery := h.remoteDB.Model(&Click{}).
		Limit(params.Limit).
		Offset(params.Offset).
		Order("id DESC")

	// Добавляем фильтрацию по домену
	if params.Domain != "" {
		dbQuery = dbQuery.Where("domain = ?", params.Domain)
	}

	// Добавляем фильтрацию по датам
	if params.StartDate != nil && params.EndDate != nil {
		// Если указаны обе даты
		dbQuery = dbQuery.Where("created_at BETWEEN ? AND ?", params.StartDate, params.EndDate)
	} else if params.StartDate != nil {
		// Если указана только начальная дата
		dbQuery = dbQuery.Where("created_at >= ?", params.StartDate)
	} else if params.EndDate != nil {
		// Если указана только конечная дата
		dbQuery = dbQuery.Where("created_at <= ?", params.EndDate)
	}

	// Выполняем запрос
	result := dbQuery.Find(&clicks)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return nil, fmt.Errorf("ошибка при получении данных из БД ADS: %v", result.Error)
	}

	// Распаковка JSON
	clicks = processClicksForBotAnalysis(h, clicks)

	return clicks, nil
}

func processClicksForBotAnalysis(h *handler, clicks []Click) []Click {
	for i := range clicks {
		// Распаковываем Headers в HeadersField
		if err := json.Unmarshal([]byte(clicks[i].Headers), &clicks[i].HeadersField); err != nil {
			h.logger.Errorf("Ошибка при разборе Headers JSON для Click ID %d: %v\n", clicks[i].ID, err)
			continue
		}

		// Распаковываем JsData в BrowserInfo
		if err := json.Unmarshal([]byte(clicks[i].JsData), &clicks[i].BrowserInfo); err != nil {
			//h.logger.Errorf("Ошибка при разборе JsData JSON для Click ID %d: %v\n", clicks[i].ID, err)
			continue
		}
	}

	return clicks
}

// Анализ кликов на предмет ботов
func analyzeClicksForBots(h *handler, clicks []Click) []BotAnalysisResult {
	results := make([]BotAnalysisResult, 0, len(clicks))

	// Создаем карты для анализа паттернов в текущей выборке
	fingerprintMap := make(map[string]int)
	ipMap := make(map[string][]Click)

	// Первый проход - собираем статистику
	for _, click := range clicks {
		if click.Fingerprint != "" {
			fingerprintMap[click.Fingerprint]++
		}
		ipMap[click.IP] = append(ipMap[click.IP], click)
	}

	// Второй проход - анализируем каждый клик
	for _, click := range clicks {
		result := BotAnalysisResult{
			Click:            click,
			BotIndicators:    []BotIndicator{},
			AllCheckedParams: []BotIndicator{},
		}

		// Анализируем клик
		analyzeSingleClick(&result, fingerprintMap, ipMap, h)

		// Вычисляем финальный статус
		calculateBotStatus(&result)

		// Генерируем отчет
		generateAnalysisReport(&result)

		results = append(results, result)
	}

	return results
}

// analyzeBot - функция для анализа одного клика (используется в downloadBotAnalysisCSV)
func analyzeBot(result *BotAnalysisResult, clicks []Click) {
	// Создаем карты для анализа
	fingerprintMap := make(map[string]int)
	ipMap := make(map[string][]Click)
	
	// Собираем статистику
	for _, click := range clicks {
		if click.Fingerprint != "" {
			fingerprintMap[click.Fingerprint]++
		}
		ipMap[click.IP] = append(ipMap[click.IP], click)
	}
	
	// Анализируем клик используя существующую функцию
	// Передаём nil вместо handler так как он не используется в analyzeSingleClick
	analyzeSingleClick(result, fingerprintMap, ipMap, nil)
	
	// Вычисляем финальный статус
	calculateBotStatus(result)
	
	// Генерируем отчет
	generateAnalysisReport(result)
}

// Анализ одного клика с проверкой ВСЕХ параметров
func analyzeSingleClick(result *BotAnalysisResult, fingerprintMap map[string]int, ipMap map[string][]Click, h *handler) {
	score := 0
	allParams := []BotIndicator{}
	triggeredParams := []BotIndicator{}

	// Парсим время для использования во всех проверках
	timeSpent := parseTimeSpent(result.TimeSpent)

	// Проверяем наличие РЕАЛЬНОЙ активности (не нулевые координаты)
	// X:0 Y:0 - это не реальный клик, а дефолтное значение
	hasRealClicks := result.ClickCoordinates != "" &&
		result.ClickCoordinates != "[]" &&
		!strings.Contains(result.ClickCoordinates, "X:0 Y:0")

	// Для скролла проверяем что есть ненулевые значения
	hasRealScroll := result.ScrollCoordinates != "" &&
		result.ScrollCoordinates != "[]" &&
		result.ScrollCoordinates != "0"

	// ========== 1. КРИТИЧЕСКИЕ ИНДИКАТОРЫ (100 баллов) ==========

	// Проверка 1: Время на сайте = 0 при наличии РЕАЛЬНОЙ активности (не нулевые координаты)
	check1 := BotIndicator{
		Name:        "zero_time_with_activity",
		Score:       100,
		Category:    "CRITICAL",
		Description: "Проверка времени при наличии активности",
		Value:       fmt.Sprintf("%.1f сек, клики: %v, скролл: %v", timeSpent, hasRealClicks, hasRealScroll),
		Expected:    "Минимум 3-5 секунд при активности",
		Checked:     true,
		Triggered:   timeSpent == 0 && (hasRealClicks || hasRealScroll),
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Этот индикатор проверяет физически невозможную ситуацию - наличие активности пользователя при нулевом времени на сайте.

ВАРИАНТЫ ПРОЯВЛЕНИЯ:
• Время = 0, но есть клики с реальными координатами (не X:0 Y:0)
• Время = 0, но есть данные о прокрутке страницы
• Мгновенные множественные клики без времени на чтение

ПОЧЕМУ ЭТО БОТ:
1. Человек физически не может кликнуть или прокрутить страницу за 0 секунд
2. Минимальное время реакции человека ~200-300мс
3. Время на загрузку страницы и визуальное восприятие минимум 1-2 секунды
4. Боты могут отправлять предзаписанные действия мгновенно

ПРИМЕРЫ:
• БОТ: время 00:00:00, клик X:450 Y:320 - программа сразу "кликнула"
• ЧЕЛОВЕК: время 00:00:05, клик X:450 Y:320 - увидел, подумал, кликнул
• БОТ: время 00:00:00, скролл до 1500px - мгновенная прокрутка
• ЧЕЛОВЕК: время 00:00:03, постепенный скролл - читает контент`,
	}
	if check1.Triggered {
		check1.Description = "Нулевое время при наличии кликов/скролла - явный признак бота"
		score += check1.Score
		triggeredParams = append(triggeredParams, check1)
	}
	allParams = append(allParams, check1)

	// Проверка 2: JavaScript данные
	hasJsData := result.JsData != "" && result.JsData != "{}"
	check2 := BotIndicator{
		Name:        "javascript_execution",
		Score:       100,
		Category:    "CRITICAL",
		Description: "Проверка выполнения JavaScript",
		Value: func() string {
			if hasJsData {
				return "JS выполнен"
			}
			return "JS не выполнен"
		}(),
		Expected:  "Данные о браузере",
		Checked:   true,
		Triggered: !hasJsData,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

JavaScript - основа современного веба. Все настоящие браузеры выполняют JS код.

ЧТО ПРОВЕРЯЕТСЯ:
• Наличие данных из JavaScript (поле JsData)
• Информация о размерах окна, экрана, плагинах
• Данные о платформе, языке, user-agent из JS

ВАРИАНТЫ БОТОВ БЕЗ JS:
• curl/wget - командные утилиты для скачивания
• Python requests/urllib - библиотеки без JS движка
• PHP file_get_contents() - простой HTTP запрос
• Простые HTTP клиенты на любом языке
• Старые версии поисковых ботов

ПОЧЕМУ ОТСУТСТВИЕ JS = БОТ:
1. 99.9% реальных пользователей имеют JS включен
2. Без JS большинство сайтов не работает
3. Отключение JS вручную крайне редко (< 0.1% пользователей)
4. Боты часто используют простые HTTP библиотеки без JS

ПРИМЕРЫ ДАННЫХ:
• БОТ: JsData = "" или "{}" - пустые данные
• ЧЕЛОВЕК: JsData = {"innerWidth":1920, "screenHeight":1080, "languages":["ru","en"], ...}
• БОТ curl: Вообще не отправляет JS данные
• ЧЕЛОВЕК Chrome: Полный набор данных о браузере и системе`,
	}
	if check2.Triggered {
		check2.Description = "JavaScript не выполнен - бот не обрабатывает JS код"
		score += check2.Score
		triggeredParams = append(triggeredParams, check2)
	}
	allParams = append(allParams, check2)

	// Проверка 3: Идентичные запросы
	identicalRequests := 0
	if len(ipMap[result.IP]) > 1 {
		for _, otherClick := range ipMap[result.IP] {
			if otherClick.ID != result.ID &&
				otherClick.Domain == result.Domain &&
				otherClick.Keyword == result.Keyword {
				identicalRequests++
			}
		}
	}
	check3 := BotIndicator{
		Name:        "identical_requests_pattern",
		Score:       100,
		Category:    "CRITICAL",
		Description: "Проверка идентичных запросов с IP",
		Value:       fmt.Sprintf("%d идентичных", identicalRequests),
		Expected:    "Уникальные запросы",
		Checked:     true,
		Triggered:   identicalRequests > 3,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Этот индикатор выявляет повторяющиеся идентичные запросы с одного IP.

ЧТО ПРОВЕРЯЕТСЯ:
• Одинаковый IP адрес
• Одинаковый домен
• Одинаковое ключевое слово
• Множественные повторы

ПОЧЕМУ ЭТО БОТ:

1. КЛИКФРОД (накрутка кликов):
• Бот многократно кликает на рекламу
• Имитация разных пользователей
• Увеличение расходов рекламодателя

2. ТЕСТОВЫЕ ЗАПРОСЫ:
• Проверка доступности сайта
• Мониторинг позиций
• Автоматические проверки

3. АТАКА НА КОНКУРЕНТОВ:
• Исчерпание бюджета конкурента
• Создание ложной статистики

ПРИМЕРЫ ПАТТЕРНОВ:
• БОТ: IP 1.2.3.4, 50 запросов на "слесарь Москва" за час
• ЧЕЛОВЕК: IP 1.2.3.4, 1-2 разных запроса в день
• ОФИС (NAT): Несколько сотрудников, один IP - норма
• БОТ-ФЕРМА: Сотни идентичных запросов в минуту

ПОРОГОВЫЕ ЗНАЧЕНИЯ:
• > 3 идентичных запросов - подозрительно
• > 10 - высокая вероятность бота
• > 50 - очевидный кликфрод`,
	}
	if check3.Triggered {
		check3.Description = "Множество идентичных запросов с одного IP"
		score += check3.Score
		triggeredParams = append(triggeredParams, check3)
	}
	allParams = append(allParams, check3)

	// ========== 2. ВЫСОКИЕ ИНДИКАТОРЫ (50 баллов) ==========

	// Проверка 4 удалена - отсутствие кликов не является признаком бота
	// Проверка 5 удалена - отсутствие скролла не является признаком бота
	// Пользователь может просто посмотреть страницу и уйти

	// Проверка 6: Повторяющийся fingerprint
	fingerprintCount := 0
	if result.Fingerprint != "" {
		fingerprintCount = fingerprintMap[result.Fingerprint]
	}
	check6 := BotIndicator{
		Name:        "fingerprint_uniqueness",
		Score:       50,
		Category:    "HIGH",
		Description: "Проверка уникальности fingerprint",
		Value:       fmt.Sprintf("%d повторений", fingerprintCount),
		Expected:    "Уникальный",
		Checked:     true,
		Triggered:   fingerprintCount > 5,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Fingerprint - уникальный цифровой отпечаток браузера и системы.

ЧТО ВХОДИТ В FINGERPRINT:
• Параметры браузера (User-Agent, версия, язык)
• Разрешение экрана и глубина цвета
• Список установленных плагинов
• Часовой пояс и локаль
• Параметры Canvas и WebGL
• Шрифты системы
• Аудио контекст

ПОЧЕМУ ПОВТОРЫ = БОТ:
1. Каждый реальный браузер уникален
2. Вероятность полного совпадения < 0.1%
3. Боты часто используют один шаблон
4. Клонированные виртуальные машины

ПРИЧИНЫ ПОВТОРОВ:
• Бот-фермы с одинаковыми браузерами
• Headless браузеры с дефолтными настройками
• Docker контейнеры с Selenium
• Клонированные VM для кликфрода

ПРИМЕРЫ:
• БОТ: Один fingerprint встречается 50+ раз
• ЧЕЛОВЕК: Каждый fingerprint уникален
• БОТ-ФЕРМА: 100 браузеров с идентичным fingerprint
• ОФИС: 2-3 повтора (коллеги с одинаковыми ПК) - норма`,
	}
	if check6.Triggered {
		check6.Description = "Fingerprint повторяется слишком часто"
		score += check6.Score
		triggeredParams = append(triggeredParams, check6)
	}
	allParams = append(allParams, check6)

	// Проверка 7: User-Agent
	isSuspicious := isSuspiciousUserAgent(result.HeadersField.UserAgent)
	check7 := BotIndicator{
		Name:        "user_agent_analysis",
		Score:       50,
		Category:    "HIGH",
		Description: "Проверка User-Agent",
		Value:       truncateString(result.HeadersField.UserAgent, 50),
		Expected:    "Chrome/Firefox/Safari",
		Checked:     true,
		Triggered:   isSuspicious,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

User-Agent - строка идентификации браузера и системы.

ПОДОЗРИТЕЛЬНЫЕ USER-AGENT:

1. ЯВНЫЕ БОТЫ:
• Googlebot, Bingbot, YandexBot - поисковые боты
• AhrefsBot, SemrushBot - SEO боты
• FacebookExternalHit, LinkedInBot - соцсети
• GPTBot, Claude-Web - AI боты

2. ПРОГРАММНЫЕ КЛИЕНТЫ:
• curl/7.68.0, wget/1.20 - командные утилиты
• Python-requests/2.28 - Python библиотека
• Go-http-client - Go клиент
• Java/1.8.0 - Java приложения
• PostmanRuntime - API тестирование

3. АВТОМАТИЗАЦИЯ:
• HeadlessChrome - Chrome без UI
• PhantomJS, Puppeteer - автоматизация
• Selenium, WebDriver - тестирование

4. ПОДОЗРИТЕЛЬНЫЕ ПРИЗНАКИ:
• Пустой или слишком короткий UA
• Отсутствие Mozilla/Chrome/Safari
• Устаревшие версии (IE6, Firefox 3)
• Нестандартный формат

НОРМАЛЬНЫЕ USER-AGENT:
• Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0
• Firefox: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0
• Safari: Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 Safari/17.2
• Edge: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/120.0.0.0

ПРИМЕРЫ:
• БОТ: "python-requests/2.31.0" - явный скрипт
• БОТ: "Mozilla/5.0 (compatible; Googlebot/2.1)" - поисковый бот
• ЧЕЛОВЕК: Полный Chrome UA с актуальной версией`,
	}
	if check7.Triggered {
		check7.Description = "Подозрительный или бот User-Agent"
		score += check7.Score
		triggeredParams = append(triggeredParams, check7)
	}
	allParams = append(allParams, check7)

	// ========== 3. СРЕДНИЕ ИНДИКАТОРЫ (25 баллов) ==========

	// Проверка 8 удалена - ночная активность нормальна для экстренных служб
	// (слесарь, сантехник и т.д. могут вызываться круглосуточно)

	// Проверка 9: Частота с IP
	ipRequestCount := len(ipMap[result.IP])
	check9 := BotIndicator{
		Name:        "ip_request_frequency",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Проверка частоты запросов с IP",
		Value:       fmt.Sprintf("%d запросов", ipRequestCount),
		Expected:    "1-3 запроса",
		Checked:     true,
		Triggered:   ipRequestCount > 10,
	}
	if check9.Triggered {
		check9.Description = "Слишком много запросов с одного IP"
		score += check9.Score
		triggeredParams = append(triggeredParams, check9)
	}
	allParams = append(allParams, check9)

	// Проверка 10: Referrer
	hasReferrer := result.HeadersField.Referer != ""
	check10 := BotIndicator{
		Name:        "referrer_presence",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Проверка источника перехода",
		Value: func() string {
			if hasReferrer {
				return truncateString(result.HeadersField.Referer, 30)
			}
			return "Отсутствует"
		}(),
		Expected:  "Google/Bing",
		Checked:   true,
		Triggered: !hasReferrer,
	}
	if check10.Triggered {
		check10.Description = "Отсутствует referrer - прямой доступ или бот"
		score += check10.Score
		triggeredParams = append(triggeredParams, check10)
	}
	allParams = append(allParams, check10)

	// Проверка 11: HTTP заголовки
	hasAbnormal := hasAbnormalHeaders(result.HeadersField)
	check11 := BotIndicator{
		Name:        "http_headers_validation",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Проверка HTTP заголовков",
		Value: func() string {
			if hasAbnormal {
				return "Аномальные"
			}
			return "Стандартные"
		}(),
		Expected:  "Полный набор",
		Checked:   true,
		Triggered: hasAbnormal,
	}
	if check11.Triggered {
		check11.Description = "Нестандартные или отсутствующие заголовки"
		score += check11.Score
		triggeredParams = append(triggeredParams, check11)
	}
	allParams = append(allParams, check11)

	// ========== 4. НИЗКИЕ ИНДИКАТОРЫ (10 баллов) ==========

	// Проверка 12: Короткое время (1-3 сек)
	check12 := BotIndicator{
		Name:        "session_duration",
		Score:       10,
		Category:    "LOW",
		Description: "Проверка длительности сессии",
		Value:       fmt.Sprintf("%.1f секунд", timeSpent),
		Expected:    "10-15 секунд",
		Checked:     true,
		Triggered:   timeSpent > 0 && timeSpent < 3,
	}
	if check12.Triggered {
		check12.Description = "Очень короткое время на сайте"
		score += check12.Score
		triggeredParams = append(triggeredParams, check12)
	}
	allParams = append(allParams, check12)

	// Проверка 13: Языковые настройки
	hasLanguage := result.HeadersField.AcceptLanguage != ""
	check13 := BotIndicator{
		Name:        "language_settings",
		Score:       10,
		Category:    "LOW",
		Description: "Проверка языковых настроек",
		Value: func() string {
			if hasLanguage {
				return result.HeadersField.AcceptLanguage
			}
			return "Не указан"
		}(),
		Expected:  "en-US/ru-RU",
		Checked:   true,
		Triggered: !hasLanguage,
	}
	if check13.Triggered {
		check13.Description = "Отсутствуют языковые настройки"
		score += check13.Score
		triggeredParams = append(triggeredParams, check13)
	}
	allParams = append(allParams, check13)

	// Проверка 14: Версия браузера
	isOutdated := isOutdatedBrowser(result.HeadersField.UserAgent)
	check14 := BotIndicator{
		Name:        "browser_version",
		Score:       10,
		Category:    "LOW",
		Description: "Проверка версии браузера",
		Value: func() string {
			if isOutdated {
				return "Устаревшая"
			}
			return "Актуальная"
		}(),
		Expected:  "Актуальная версия",
		Checked:   true,
		Triggered: isOutdated,
	}
	if check14.Triggered {
		check14.Description = "Устаревшая версия браузера"
		score += check14.Score
		triggeredParams = append(triggeredParams, check14)
	}
	allParams = append(allParams, check14)

	// ========== 5. ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ НА ОСНОВЕ АНАЛИЗА ЛОГОВ ==========

	// Проверка 15: Accept заголовок (должен быть */* для POST запросов)
	suspiciousAccept := result.HeadersField.Accept != "" && result.HeadersField.Accept != "*/*"
	check15 := BotIndicator{
		Name:        "accept_header_validation",
		Score:       50,
		Category:    "HIGH",
		Description: "Проверка Accept заголовка для POST",
		Value:       result.HeadersField.Accept,
		Expected:    "*/* (для POST запросов)",
		Checked:     true,
		Triggered:   suspiciousAccept,
	}
	if check15.Triggered {
		check15.Description = "Нестандартный Accept заголовок для POST запроса"
		score += check15.Score
		triggeredParams = append(triggeredParams, check15)
	}
	allParams = append(allParams, check15)

	// Проверка 16: Анализ размеров окна браузера
	suspiciousWindowSize := false
	windowSizeInfo := "Нет данных"
	if result.BrowserInfo.InnerWidth > 0 {
		// Проверяем подозрительные размеры окон
		if result.BrowserInfo.InnerWidth == result.BrowserInfo.ScreenWidth &&
			result.BrowserInfo.InnerHeight == result.BrowserInfo.ScreenHeight {
			// Полноэкранный режим - может быть headless браузер
			suspiciousWindowSize = true
			windowSizeInfo = fmt.Sprintf("Полноэкранный: %dx%d", result.BrowserInfo.InnerWidth, result.BrowserInfo.InnerHeight)
		} else if result.BrowserInfo.InnerWidth < 300 || result.BrowserInfo.InnerHeight < 300 {
			// Слишком маленькое окно
			suspiciousWindowSize = true
			windowSizeInfo = fmt.Sprintf("Слишком маленькое: %dx%d", result.BrowserInfo.InnerWidth, result.BrowserInfo.InnerHeight)
		} else if result.BrowserInfo.InnerWidth > 3000 || result.BrowserInfo.InnerHeight > 2000 {
			// Слишком большое окно
			suspiciousWindowSize = true
			windowSizeInfo = fmt.Sprintf("Слишком большое: %dx%d", result.BrowserInfo.InnerWidth, result.BrowserInfo.InnerHeight)
		} else {
			windowSizeInfo = fmt.Sprintf("Нормальное: %dx%d", result.BrowserInfo.InnerWidth, result.BrowserInfo.InnerHeight)
		}
	}

	check16 := BotIndicator{
		Name:        "window_size_analysis",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Анализ размеров окна браузера",
		Value:       windowSizeInfo,
		Expected:    "300-3000px ширина",
		Checked:     true,
		Triggered:   suspiciousWindowSize,
	}
	if check16.Triggered {
		check16.Description = "Подозрительные размеры окна браузера"
		score += check16.Score
		triggeredParams = append(triggeredParams, check16)
	}
	allParams = append(allParams, check16)

	// Проверка 17 удалена - нулевые координаты X:0 Y:0 при нулевом времени
	// это просто дефолтные значения, а не признак бота

	// Проверка 18: Отсутствие GCLID при наличии Google Ads трафика
	missingGCLID := result.Gclid == "" || result.Gclid == "-"
	check18 := BotIndicator{
		Name:        "gclid_presence",
		Score:       10,
		Category:    "LOW",
		Description: "Проверка наличия GCLID",
		Value: func() string {
			if missingGCLID {
				return "Отсутствует"
			}
			return "Присутствует"
		}(),
		Expected:  "GCLID для Google Ads",
		Checked:   true,
		Triggered: missingGCLID && result.AccountID != "-",
	}
	if check18.Triggered {
		check18.Description = "Отсутствует GCLID при наличии Account ID"
		score += check18.Score
		triggeredParams = append(triggeredParams, check18)
	}
	allParams = append(allParams, check18)

	// ========== 6. ДОПОЛНИТЕЛЬНЫЕ ПРОВЕРКИ НА ОСНОВЕ ГЛУБОКОГО АНАЛИЗА ==========

	// Проверка 19: Соотношение внутренних и внешних размеров окна
	suspiciousRatio := false
	ratioInfo := "Нет данных"
	if result.BrowserInfo.OuterWidth > 0 && result.BrowserInfo.InnerWidth > 0 {
		diff := result.BrowserInfo.OuterWidth - result.BrowserInfo.InnerWidth
		// Нормальная разница обычно 0-100px (для панелей браузера)
		if diff < 0 || diff > 200 {
			suspiciousRatio = true
			ratioInfo = fmt.Sprintf("Аномальная разница: %dpx", diff)
		} else if result.BrowserInfo.OuterWidth == 1 && result.BrowserInfo.OuterHeight == 1 {
			// Явный признак headless браузера
			suspiciousRatio = true
			ratioInfo = "Outer 1x1 - headless браузер"
		} else {
			ratioInfo = fmt.Sprintf("Нормальная разница: %dpx", diff)
		}
	}

	check19 := BotIndicator{
		Name:        "window_ratio_analysis",
		Score:       50,
		Category:    "HIGH",
		Description: "Анализ соотношения размеров окна",
		Value:       ratioInfo,
		Expected:    "Разница 0-100px",
		Checked:     true,
		Triggered:   suspiciousRatio,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Этот индикатор проверяет физическую логику размеров окна браузера.

ЧТО ОЗНАЧАЮТ РАЗМЕРЫ:
• OuterWidth/Height - полный размер окна браузера (включая панели, адресную строку, границы)
• InnerWidth/Height - размер области контента (где отображается сайт)
• Разница = OuterWidth - InnerWidth

ПОДОЗРИТЕЛЬНЫЕ СЛУЧАИ:

1. ОТРИЦАТЕЛЬНАЯ РАЗНИЦА (например, -14px):
   • InnerWidth > OuterWidth - физически невозможно!
   • Контент не может быть больше окна
   • Явный признак неправильной эмуляции браузера
   • Бот неправильно установил размеры

2. СЛИШКОМ БОЛЬШАЯ РАЗНИЦА (> 200px):
   • Нормальные панели занимают 16-100px
   • 200px+ слишком много для панелей
   • Возможно модифицированный браузер

3. OuterWidth = 1, OuterHeight = 1:
   • Классический признак headless браузера
   • Puppeteer/Playwright/Selenium по умолчанию
   • Автоматизированный браузер без UI

НОРМАЛЬНЫЕ ЗНАЧЕНИЯ:
• 0px - полноэкранный режим (F11), легитимно
• 16-40px - только границы окна (macOS, Linux)
• 40-100px - панели инструментов и адресная строка
• 100-150px - дополнительные панели (закладки, DevTools)

ПРИМЕРЫ:
• БОТ: Outer: 800x600, Inner: 820x620 (разница -20px) - невозможно!
• ЧЕЛОВЕК Chrome: Outer: 1920x1080, Inner: 1904x971 (разница 16px) - норма
• БОТ Headless: Outer: 1x1, Inner: 800x600 - headless режим
• ЧЕЛОВЕК F11: Outer: 1920x1080, Inner: 1920x1080 (разница 0) - полный экран`,
	}
	if check19.Triggered {
		check19.Description = "Подозрительное соотношение inner/outer размеров"
		score += check19.Score
		triggeredParams = append(triggeredParams, check19)
	}
	allParams = append(allParams, check19)

	// Проверка 20: Количество плагинов браузера
	suspiciousPlugins := false
	pluginsInfo := "Нет данных"
	if result.BrowserInfo.PluginsLength >= 0 {
		// Десктоп обычно имеет 3-10 плагинов, мобильный 0-2
		if result.Device == "c" && result.BrowserInfo.PluginsLength == 0 {
			// Десктоп без плагинов подозрителен
			suspiciousPlugins = true
			pluginsInfo = "Десктоп без плагинов"
		} else if result.BrowserInfo.PluginsLength > 20 {
			// Слишком много плагинов
			suspiciousPlugins = true
			pluginsInfo = fmt.Sprintf("Слишком много: %d", result.BrowserInfo.PluginsLength)
		} else {
			pluginsInfo = fmt.Sprintf("Нормально: %d", result.BrowserInfo.PluginsLength)
		}
	}

	check20 := BotIndicator{
		Name:        "plugins_count_validation",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Проверка количества плагинов",
		Value:       pluginsInfo,
		Expected:    "3-10 для десктоп",
		Checked:     true,
		Triggered:   suspiciousPlugins,
	}
	if check20.Triggered {
		check20.Description = "Аномальное количество плагинов"
		score += check20.Score
		triggeredParams = append(triggeredParams, check20)
	}
	allParams = append(allParams, check20)

	// Проверка 21: Сетевые характеристики (RTT и downlink)
	suspiciousNetwork := false
	networkInfo := "Нет данных"
	if result.BrowserInfo.RTT >= 0 && result.BrowserInfo.Downlink >= 0 {
		// RTT = 0 и идеальная скорость подозрительны
		if result.BrowserInfo.RTT == 0 && result.BrowserInfo.Downlink == 10 {
			suspiciousNetwork = true
			networkInfo = "Идеальная сеть (RTT=0, DL=10)"
		} else if result.BrowserInfo.RTT > 1000 {
			suspiciousNetwork = true
			networkInfo = fmt.Sprintf("Очень высокий RTT: %d", result.BrowserInfo.RTT)
		} else {
			networkInfo = fmt.Sprintf("RTT=%d, DL=%.1f", result.BrowserInfo.RTT, result.BrowserInfo.Downlink)
		}
	}

	check21 := BotIndicator{
		Name:        "network_characteristics",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Анализ сетевых характеристик",
		Value:       networkInfo,
		Expected:    "RTT 10-500ms",
		Checked:     true,
		Triggered:   suspiciousNetwork,
	}
	if check21.Triggered {
		check21.Description = "Подозрительные сетевые характеристики"
		score += check21.Score
		triggeredParams = append(triggeredParams, check21)
	}
	allParams = append(allParams, check21)

	// Проверка 22: Соответствие языков в заголовках и JS
	languageMismatch := false
	languageInfo := "Соответствует"
	if result.HeadersField.AcceptLanguage != "" && len(result.BrowserInfo.Languages) > 0 {
		headerLang := strings.ToLower(strings.Split(result.HeadersField.AcceptLanguage, ",")[0])
		jsLang := strings.ToLower(result.BrowserInfo.Languages[0])
		if !strings.Contains(headerLang, jsLang[:2]) && !strings.Contains(jsLang, headerLang[:2]) {
			languageMismatch = true
			languageInfo = fmt.Sprintf("Header: %s vs JS: %s", headerLang, jsLang)
		}
	}

	check22 := BotIndicator{
		Name:        "language_consistency",
		Score:       25,
		Category:    "MEDIUM",
		Description: "Проверка согласованности языков",
		Value:       languageInfo,
		Expected:    "Совпадение языков",
		Checked:     true,
		Triggered:   languageMismatch,
	}
	if check22.Triggered {
		check22.Description = "Несоответствие языков в заголовках и JS"
		score += check22.Score
		triggeredParams = append(triggeredParams, check22)
	}
	allParams = append(allParams, check22)

	// Проверка 23: Google-Read-Aloud бот (обнаружен в анализе)
	isGoogleReadAloud := strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "google-read-aloud") ||
	                     strings.Contains(strings.ToLower(result.BrowserInfo.UserAgent), "google-read-aloud")
	check23 := BotIndicator{
		Name:        "google_read_aloud_bot",
		Score:       100,
		Category:    "CRITICAL",
		Description: "Проверка на Google-Read-Aloud бота",
		Value: func() string {
			if isGoogleReadAloud {
				return "Обнаружен Google-Read-Aloud"
			}
			return "Не обнаружен"
		}(),
		Expected:  "Обычный браузер",
		Checked:   true,
		Triggered: isGoogleReadAloud,
	}
	if check23.Triggered {
		check23.Description = "Обнаружен Google-Read-Aloud бот"
		score += check23.Score
		triggeredParams = append(triggeredParams, check23)
	}
	allParams = append(allParams, check23)
	
	// Проверка 24: Несоответствие User-Agent между HTTP и JavaScript
	uaMismatch := false
	uaComparisonInfo := "Соответствует"
	if result.HeadersField.UserAgent != "" && result.BrowserInfo.UserAgent != "" {
		httpUA := strings.TrimSpace(result.HeadersField.UserAgent)
		jsUA := strings.TrimSpace(result.BrowserInfo.UserAgent)
		
		if httpUA != jsUA {
			uaMismatch = true
			// Проверяем тип несоответствия
			httpLower := strings.ToLower(httpUA)
			jsLower := strings.ToLower(jsUA)
			
			if strings.Contains(httpLower, "safari") && strings.Contains(jsLower, "crios") {
				uaComparisonInfo = "HTTP: Safari, JS: Chrome iOS"
			} else if strings.Contains(httpLower, "chrome") && strings.Contains(jsLower, "safari") {
				uaComparisonInfo = "HTTP: Chrome, JS: Safari"  
			} else {
				// Показываем первые 30 символов для сравнения
				httpShort := truncateString(httpUA, 30)
				jsShort := truncateString(jsUA, 30)
				uaComparisonInfo = fmt.Sprintf("HTTP: %s... | JS: %s...", httpShort, jsShort)
			}
		}
	}
	
	check24 := BotIndicator{
		Name:        "user_agent_consistency",
		Score:       100,
		Category:    "CRITICAL",
		Description: "Проверка соответствия User-Agent HTTP/JS",
		Value:       uaComparisonInfo,
		Expected:    "Идентичные User-Agent",
		Checked:     true,
		Triggered:   uaMismatch,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

User-Agent должен быть ИДЕНТИЧНЫМ в HTTP заголовках и JavaScript navigator.userAgent.

ЧТО ПРОВЕРЯЕТСЯ:
• HTTP заголовок User-Agent (отправляется браузером)
• navigator.userAgent из JavaScript (читается через JS API)
• Полное посимвольное совпадение строк

ПОЧЕМУ ДОЛЖНЫ СОВПАДАТЬ:
1. Браузер использует одну и ту же строку UA везде
2. navigator.userAgent возвращает тот же UA что в заголовках
3. Это базовая консистентность браузера
4. Изменение UA в одном месте но не в другом = признак манипуляции

КОГДА НЕ СОВПАДАЮТ = БОТ:

1. НЕПРАВИЛЬНАЯ ЭМУЛЯЦИЯ:
• Бот установил UA в HTTP но забыл в JS
• Использование разных библиотек для HTTP и JS
• Ошибка в коде бота при подмене UA

2. ТИПИЧНЫЕ ПАТТЕРНЫ БОТОВ:
• HTTP: обычный браузер, JS: пустой/дефолтный
• HTTP: Chrome, JS: PhantomJS/Headless
• HTTP: мобильный, JS: десктопный
• HTTP: Safari, JS: Chrome (как в примере)

3. ИНСТРУМЕНТЫ С ОШИБКАМИ:
• Puppeteer с неправильными настройками
• Selenium с разными UA в capabilities и JS
• Прокси/VPN меняющие заголовки но не JS

РЕАЛЬНЫЕ ПРИМЕРЫ:
• БОТ: HTTP "Safari/604.1", JS "CriOS/139" - разные браузеры!
• БОТ: HTTP "Chrome/120", JS "Mozilla/5.0" - неполный UA в JS
• ЧЕЛОВЕК: Полностью идентичные строки в обоих местах
• БОТ: HTTP современный Chrome, JS устаревший Chrome

ЛЕГИТИМНЫЕ ИСКЛЮЧЕНИЯ:
• Браузерные расширения (но очень редко)
• Корпоративные прокси (но должны быть консистентны)
• Privacy tools (но обычно меняют оба)

ВАЖНО: Даже разница в 1 символ = подозрительно!`,
	}
	if check24.Triggered {
		check24.Description = "User-Agent не совпадает между HTTP и JS - явный признак бота"
		score += check24.Score
		triggeredParams = append(triggeredParams, check24)
	}
	allParams = append(allParams, check24)
	
	// Проверка 25: Плагины на мобильных устройствах
	suspiciousMobilePlugins := false
	mobilePluginsInfo := "Не мобильное устройство"
	
	// Определяем мобильное устройство
	isMobile := false
	if result.Device == "m" || result.Device == "t" || // m = mobile, t = tablet
	   strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "mobile") ||
	   strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "android") ||
	   strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "iphone") ||
	   strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "ipad") {
		isMobile = true
	}
	
	if isMobile && result.BrowserInfo.PluginsLength >= 0 {
		pluginCount := result.BrowserInfo.PluginsLength
		
		// iPhone/iPad НИКОГДА не имеют плагинов в Safari/Chrome
		if (strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "iphone") ||
		    strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "ipad")) && 
		   pluginCount > 0 {
			suspiciousMobilePlugins = true
			mobilePluginsInfo = fmt.Sprintf("iPhone/iPad с %d плагинами!", pluginCount)
		} else if strings.Contains(strings.ToLower(result.HeadersField.UserAgent), "android") && 
		          pluginCount > 2 {
			// Android может иметь 0-2 плагина максимум
			suspiciousMobilePlugins = true  
			mobilePluginsInfo = fmt.Sprintf("Android с %d плагинами", pluginCount)
		} else if isMobile && pluginCount > 3 {
			// Любое мобильное с > 3 плагинов подозрительно
			suspiciousMobilePlugins = true
			mobilePluginsInfo = fmt.Sprintf("Мобильное с %d плагинами", pluginCount)
		} else {
			mobilePluginsInfo = fmt.Sprintf("Мобильное: %d плагинов (норма)", pluginCount)
		}
	}
	
	check25 := BotIndicator{
		Name:        "mobile_plugins_validation",
		Score:       75,
		Category:    "HIGH",
		Description: "Проверка плагинов на мобильных устройствах",
		Value:       mobilePluginsInfo,
		Expected:    "0 для iOS, 0-2 для Android",
		Checked:     isMobile,
		Triggered:   suspiciousMobilePlugins,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Мобильные браузеры имеют строгие ограничения на плагины из-за архитектуры и безопасности.

НОРМАЛЬНЫЕ ЗНАЧЕНИЯ:

1. iOS (iPhone/iPad):
• Safari: ВСЕГДА 0 плагинов
• Chrome для iOS: ВСЕГДА 0 плагинов  
• Любой браузер на iOS: ВСЕГДА 0 плагинов
• iOS не поддерживает плагины вообще!

2. Android:
• Chrome: обычно 0 плагинов
• Firefox: может быть 1-2 плагина
• Samsung Browser: 0-1 плагин
• Максимум: 2 плагина (очень редко)

3. Планшеты:
• iPad: ВСЕГДА 0 плагинов
• Android планшеты: 0-2 плагина

ПОЧЕМУ ЭТО ВАЖНО:

1. АРХИТЕКТУРНЫЕ ОГРАНИЧЕНИЯ:
• iOS полностью запрещает плагины (sandboxing)
• Android сильно ограничивает плагины
• Мобильные браузеры используют встроенные API

2. ПРИЗНАКИ БОТА ПРИ НАРУШЕНИИ:
• 5 плагинов на iPhone = НЕВОЗМОЖНО
• 10+ плагинов на Android = НЕВОЗМОЖНО
• Десктопное количество плагинов на мобильном UA

3. ТИПИЧНЫЕ ОШИБКИ БОТОВ:
• Копируют десктопный fingerprint с мобильным UA
• Используют дефолтные значения Puppeteer/Selenium
• Не адаптируют количество плагинов под устройство

РЕАЛЬНЫЕ ПРИМЕРЫ:

• БОТ: iPhone с 5 плагинами - физически невозможно!
• БОТ: Android с 15 плагинами - явная эмуляция
• ЧЕЛОВЕК iPhone: всегда 0 плагинов
• ЧЕЛОВЕК Android: 0-1 плагин обычно

КАК БОТЫ ОШИБАЮТСЯ:
1. Используют десктопный Chrome в headless режиме
2. Подменяют UA на мобильный но не меняют plugins
3. Клонируют десктопный fingerprint
4. Не знают об ограничениях iOS

ДЕТЕКЦИЯ:
• iPhone/iPad + plugins > 0 = 100% БОТ
• Android + plugins > 2 = 95% БОТ  
• Мобильный UA + plugins > 3 = 99% БОТ`,
	}
	if check25.Triggered {
		check25.Description = "Аномальное количество плагинов для мобильного устройства"
		score += check25.Score
		triggeredParams = append(triggeredParams, check25)
	}
	allParams = append(allParams, check25)
	
	// Проверка 26: Platform несоответствие для мобильных устройств
	platformMismatch := false
	platformInfo := "Платформа соответствует устройству"
	
	// Получаем Platform из JS данных
	jsPlatform := strings.ToLower(result.BrowserInfo.Platform)
	userAgent := strings.ToLower(result.HeadersField.UserAgent)
	
	// Проверяем несоответствие платформы для мобильных устройств
	if isMobile {
		// iPhone/iPad ДОЛЖНЫ иметь платформу iPhone/iPad/iPod
		if strings.Contains(userAgent, "iphone") {
			if !strings.Contains(jsPlatform, "iphone") && 
			   !strings.Contains(jsPlatform, "ios") &&
			   jsPlatform != "" {
				platformMismatch = true
				platformInfo = fmt.Sprintf("iPhone с платформой '%s' (должна быть iPhone)", jsPlatform)
			}
		} else if strings.Contains(userAgent, "ipad") {
			if !strings.Contains(jsPlatform, "ipad") && 
			   !strings.Contains(jsPlatform, "ios") &&
			   jsPlatform != "" {
				platformMismatch = true
				platformInfo = fmt.Sprintf("iPad с платформой '%s' (должна быть iPad)", jsPlatform)
			}
		} else if strings.Contains(userAgent, "android") {
			// Android устройства НЕ должны иметь десктопные платформы
			if strings.Contains(jsPlatform, "win") ||
			   strings.Contains(jsPlatform, "mac") ||
			   jsPlatform == "linux x86_64" ||
			   jsPlatform == "linux i686" {
				platformMismatch = true
				platformInfo = fmt.Sprintf("Android с десктопной платформой '%s'", jsPlatform)
			}
			// Нормальные Android платформы: "Linux armv7l", "Linux armv8l", "Linux aarch64", или просто "Android"
			if jsPlatform != "" && !strings.Contains(jsPlatform, "linux arm") && 
			   !strings.Contains(jsPlatform, "linux aarch") && 
			   !strings.Contains(jsPlatform, "android") &&
			   !platformMismatch {
				// Проверяем подозрительные платформы для Android
				if jsPlatform == "linux x86_64" || jsPlatform == "linux i686" {
					platformMismatch = true
					platformInfo = fmt.Sprintf("Android с x86/x64 платформой '%s' (подозрительно)", jsPlatform)
				}
			}
		}
	} else {
		// Для десктопов проверяем обратное - мобильные платформы на десктопном UA
		if !strings.Contains(userAgent, "mobile") && 
		   !strings.Contains(userAgent, "android") &&
		   !strings.Contains(userAgent, "iphone") &&
		   !strings.Contains(userAgent, "ipad") {
			if strings.Contains(jsPlatform, "iphone") ||
			   strings.Contains(jsPlatform, "ipad") ||
			   strings.Contains(jsPlatform, "android") ||
			   strings.Contains(jsPlatform, "arm") {
				platformMismatch = true
				platformInfo = fmt.Sprintf("Десктоп UA с мобильной платформой '%s'", jsPlatform)
			}
		}
	}
	
	// Дополнительная проверка для явно несоответствующих комбинаций
	if strings.Contains(userAgent, "windows") && strings.Contains(jsPlatform, "mac") {
		platformMismatch = true
		platformInfo = fmt.Sprintf("Windows UA с Mac платформой '%s'", jsPlatform)
	} else if strings.Contains(userAgent, "mac") && strings.Contains(jsPlatform, "win") {
		platformMismatch = true
		platformInfo = fmt.Sprintf("Mac UA с Windows платформой '%s'", jsPlatform)
	}
	
	check26 := BotIndicator{
		Name:        "platform_consistency",
		Score:       85,
		Category:    "CRITICAL",
		Description: "Проверка соответствия Platform устройству",
		Value:       platformInfo,
		Expected:    "Платформа соответствует типу устройства",
		Checked:     true,
		Triggered:   platformMismatch,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Navigator.platform - это JavaScript свойство, которое возвращает платформу браузера.
Оно ДОЛЖНО соответствовать реальному устройству из User-Agent.

ПРАВИЛЬНЫЕ СООТВЕТСТВИЯ:

1. iOS УСТРОЙСТВА:
• iPhone → platform: "iPhone"
• iPad → platform: "iPad" или "MacIntel" (новые iPad)
• iPod → platform: "iPod"
• НИКОГДА: "Win32", "Linux", "Android"

2. ANDROID УСТРОЙСТВА:
• Телефоны → platform: "Linux armv7l", "Linux armv8l", "Linux aarch64"
• Планшеты → platform: аналогично телефонам
• Эмуляторы → platform: "Linux i686", "Linux x86_64" (подозрительно!)
• НИКОГДА: "Win32", "MacIntel", "iPhone"

3. WINDOWS ДЕСКТОПЫ:
• 32-bit → platform: "Win32"
• 64-bit → platform: "Win32" или "Win64"
• НИКОГДА: "MacIntel", "Linux", мобильные платформы

4. MAC ДЕСКТОПЫ:
• Intel Mac → platform: "MacIntel"
• Apple Silicon → platform: "MacIntel"
• НИКОГДА: "Win32", "Linux", мобильные платформы

5. LINUX ДЕСКТОПЫ:
• 64-bit → platform: "Linux x86_64"
• 32-bit → platform: "Linux i686"
• ARM → platform: "Linux aarch64" (Raspberry Pi и т.д.)

ТИПИЧНЫЕ ОШИБКИ БОТОВ:

1. LINUX X86_64 НА МОБИЛЬНЫХ:
• Android телефон с platform="Linux x86_64" = БОТ
• Реальные Android используют ARM процессоры
• x86_64 = эмулятор или headless Chrome на сервере

2. НЕСООТВЕТСТВИЕ ОС:
• Windows UA + Mac platform = невозможно
• iPhone UA + Win32 platform = невозможно
• Mac UA + Linux platform = маловероятно

3. ДЕСКТОПНАЯ ПЛАТФОРМА НА МОБИЛЬНОМ:
• iPhone с "Win32" = БОТ (100%)
• Android с "MacIntel" = БОТ (100%)
• iPad с "Linux x86_64" = БОТ (100%)

4. МОБИЛЬНАЯ ПЛАТФОРМА НА ДЕСКТОПЕ:
• Chrome Windows с "iPhone" platform = БОТ
• Firefox Mac с "Linux armv7l" = БОТ

ПОЧЕМУ ЭТО ПРОИСХОДИТ:

1. КОПИРОВАНИЕ FINGERPRINT:
• Боты копируют десктопный fingerprint
• Меняют только User-Agent
• Забывают изменить navigator.platform

2. HEADLESS БРАУЗЕРЫ:
• Puppeteer/Playwright на Linux сервере
• Эмулируют мобильный User-Agent
• Platform остается "Linux x86_64"

3. ВИРТУАЛЬНЫЕ МАШИНЫ:
• Android эмуляторы на x86 (Genymotion, Android Studio)
• Имеют x86_64 вместо ARM платформы

4. ПРОКСИ/VPN ПРИЛОЖЕНИЯ:
• Модифицируют User-Agent
• Не могут изменить navigator.platform

РЕАЛЬНЫЕ ПРИМЕРЫ ИЗ ДАННЫХ:

• БОТ: iPhone 14 Pro с platform="Linux x86_64"
• БОТ: Samsung Galaxy с platform="Win32"
• БОТ: iPad Pro с platform="Linux i686"
• ЧЕЛОВЕК: iPhone с platform="iPhone"
• ЧЕЛОВЕК: Android с platform="Linux armv8l"

СТАТИСТИКА:
По нашим данным ~15-20% ботов имеют несоответствие платформы.
Это один из самых надежных индикаторов автоматизированного трафика.`,
	}
	
	if check26.Triggered {
		check26.Description = "Platform не соответствует устройству"
		score += check26.Score
		triggeredParams = append(triggeredParams, check26)
	}
	allParams = append(allParams, check26)
	
	// Проверка 27: Время пребывания на сайте менее 1 секунды
	instantExit := false
	timeSpentInfo := fmt.Sprintf("%.2f секунд на сайте", timeSpent)
	
	// Проверяем слишком быстрый уход с сайта
	if timeSpent < 1.0 && timeSpent >= 0 {
		instantExit = true
		if timeSpent == 0 {
			timeSpentInfo = "0 секунд - мгновенный уход!"
		} else {
			timeSpentInfo = fmt.Sprintf("%.2f сек - слишком быстро!", timeSpent)
		}
	}
	
	check27 := BotIndicator{
		Name:        "instant_exit_detection",
		Score:       75,
		Category:    "HIGH",
		Description: "Проверка мгновенного ухода с сайта",
		Value:       timeSpentInfo,
		Expected:    "Минимум 1-2 секунды для человека",
		Checked:     true,
		Triggered:   instantExit,
		DetailedExplanation: `ПОДРОБНОЕ ОБЪЯСНЕНИЕ:

Время пребывания на сайте менее 1 секунды - сильный индикатор бота или автоматизированного трафика.

ПОЧЕМУ ЭТО ВАЖНО:

1. ФИЗИЧЕСКИЕ ОГРАНИЧЕНИЯ ЧЕЛОВЕКА:
• Загрузка страницы: 0.5-2 секунды
• Время реакции человека: 0.2-0.3 секунды
• Минимальное время на оценку страницы: 0.5-1 секунда
• Движение мыши к кнопке закрытия: 0.3-0.5 секунды
• ИТОГО: минимум 1-2 секунды для человека

2. ПСИХОЛОГИЧЕСКИЕ ФАКТОРЫ:
• Человек всегда оценивает увиденное
• Даже при ошибочном клике - смотрит что открылось
• Рефлекторная пауза перед закрытием
• Минимальное время принятия решения: 0.5-1 сек

3. ТЕХНИЧЕСКИЕ АСПЕКТЫ:
• 0 секунд = страница не рендерилась в браузере
• < 0.5 сек = недостаточно для загрузки контента
• < 1 сек = недостаточно для любой осознанной реакции

ТИПИЧНЫЕ ПАТТЕРНЫ:

БОТЫ (0-1 секунда):
• Проверка доступности сайта (ping)
• Сканирование ссылок
• Сбор метаданных
• Предзагрузка для последующей атаки
• Проверка редиректов

ЛЮДИ (минимум 2-5 секунд):
• Случайный клик: 2-3 секунды (оценка + закрытие)
• Ошибка в адресе: 3-5 секунд (понимание ошибки)
• Поиск информации: 5-10 секунд (сканирование страницы)
• Целевой визит: 10+ секунд

СТАТИСТИКА ПО ВРЕМЕНИ:

• 0.0 сек: 100% бот - технически невозможно для человека
• 0.1-0.5 сек: 95% бот - слишком быстро для реакции
• 0.5-1.0 сек: 85% бот - маловероятно для человека
• 1.0-2.0 сек: 50% бот - возможно быстрое закрытие
• 2.0-3.0 сек: 20% бот - нормальное быстрое закрытие
• 3.0+ сек: нормальное поведение человека

ИСКЛЮЧЕНИЯ (когда < 1 сек может быть легитимно):
• Браузерные префетчи (но они не выполняют JS)
• Broken back button (но будет повторный визит)
• Крэш браузера (но не будет JS данных)

ПРИМЕРЫ ИЗ РЕАЛЬНЫХ ДАННЫХ:

• БОТ: 0.00 сек + есть клики = невозможно
• БОТ: 0.12 сек + скролл 500px = невозможно
• БОТ: 0.5 сек + заполнена форма = невозможно
• ЧЕЛОВЕК: 2.3 сек + нет активности = быстрое закрытие
• ЧЕЛОВЕК: 5+ сек + клики = нормальное поведение

ДОПОЛНИТЕЛЬНЫЕ ИНДИКАТОРЫ:

Если время < 1 сек, проверяем:
• Были ли клики? (невозможно кликнуть за 0.5 сек)
• Был ли скролл? (невозможно скроллить за 0.5 сек)
• Есть ли JS данные? (не успели бы загрузиться)
• Повторные визиты? (человек вернулся бы)

ВЫВОД:
Время пребывания < 1 секунды - один из самых надежных индикаторов бота.
Человек физически не способен оценить страницу и закрыть её менее чем за 1 секунду.`,
	}
	
	if check27.Triggered {
		check27.Description = "Время на сайте менее 1 секунды"
		score += check27.Score
		triggeredParams = append(triggeredParams, check27)
	}
	allParams = append(allParams, check27)

	// Сохраняем результаты
	result.BotScore = score
	result.BotIndicators = triggeredParams
	result.AllCheckedParams = allParams
	result.TotalChecks = len(allParams)
	result.TriggeredChecks = len(triggeredParams)
}

// Вспомогательные функции
func parseTimeSpent(timeStr string) float64 {
	if timeStr == "" || timeStr == "0" || timeStr == "-" {
		return 0
	}

	// Проверяем формат HH:MM:SS (например "00:00:17")
	if strings.Contains(timeStr, ":") {
		parts := strings.Split(timeStr, ":")
		if len(parts) == 3 {
			var hours, minutes, seconds float64
			fmt.Sscanf(parts[0], "%f", &hours)
			fmt.Sscanf(parts[1], "%f", &minutes)
			fmt.Sscanf(parts[2], "%f", &seconds)
			return hours*3600 + minutes*60 + seconds
		}
	}

	// Парсим время в секундах (если просто число)
	timeVal, err := strconv.ParseFloat(timeStr, 64)
	if err != nil {
		return 0
	}
	return timeVal
}

func isSuspiciousUserAgent(ua string) bool {
	ua = strings.ToLower(ua)

	// Известные боты и краулеры
	botPatterns := []string{
		"bot", "crawler", "spider", "scraper", "curl", "wget",
		"python", "java", "ruby", "perl", "php", "go-http",
		"axios", "node-fetch", "okhttp", "apache-httpclient",
		"postman", "insomnia", "scrapy", "puppeteer", "playwright",
		"headless", "phantomjs", "selenium", "webdriver",
		// AI боты
		"gptbot", "claude", "bingbot", "googlebot", "yandexbot",
		"baiduspider", "duckduckbot", "facebookexternalhit",
		"linkedinbot", "twitterbot", "whatsapp", "telegram",
		"slackbot", "discordbot", "mj12bot", "ahrefsbot",
		"semrushbot", "dotbot", "petalbot", "aspiegelbot",
	}

	for _, pattern := range botPatterns {
		if strings.Contains(ua, pattern) {
			return true
		}
	}

	// Пустой или слишком короткий UA
	if len(ua) < 20 {
		return true
	}

	// Отсутствие стандартных браузерных маркеров
	hasValidBrowser := strings.Contains(ua, "mozilla") ||
		strings.Contains(ua, "chrome") ||
		strings.Contains(ua, "safari") ||
		strings.Contains(ua, "firefox") ||
		strings.Contains(ua, "edge") ||
		strings.Contains(ua, "opera")

	return !hasValidBrowser
}

// BotAnalysisExportRequest - структура запроса для экспорта результатов анализа
type BotAnalysisExportRequest struct {
	// Фильтры для выборки данных
	StartDate *time.Time `json:"startDate,omitempty"`
	EndDate   *time.Time `json:"endDate,omitempty"`
	Domain    string     `json:"domain,omitempty"`
	Limit     int        `json:"limit,omitempty"`
	Offset    int        `json:"offset,omitempty"`
	
	// Фильтры по статусу бота
	IncludeBots         bool `json:"includeBots"`         // BOT (score >= 100)
	IncludeProbableBots bool `json:"includeProbableBots"` // PROBABLE_BOT (50-99)
	IncludeSuspicious   bool `json:"includeSuspicious"`   // SUSPICIOUS (25-49)
	IncludeHumans       bool `json:"includeHumans"`       // HUMAN (< 25)
	
	// Выбор полей для экспорта
	IncludeOriginalFields bool `json:"includeOriginalFields"` // Все оригинальные поля Click
	IncludeBotAnalysis    bool `json:"includeBotAnalysis"`    // Поля анализа (score, status, probability)
	IncludeIndicators     bool `json:"includeIndicators"`     // Детали индикаторов
	
	// Дополнительные опции
	OnlyTriggeredIndicators bool `json:"onlyTriggeredIndicators"` // Только сработавшие индикаторы
}

// downloadBotAnalysisCSV - экспорт результатов анализа ботов в CSV
func (h *handler) downloadBotAnalysisCSV(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var req BotAnalysisExportRequest
	
	// Декодируем запрос
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf("Ошибка декодирования запроса: %v", err), http.StatusBadRequest)
		return
	}
	
	// Если не выбраны фильтры статусов, включаем все
	if !req.IncludeBots && !req.IncludeProbableBots && !req.IncludeSuspicious && !req.IncludeHumans {
		req.IncludeBots = true
		req.IncludeProbableBots = true
		req.IncludeSuspicious = true
		req.IncludeHumans = true
	}
	
	// Если не выбраны поля, включаем все
	if !req.IncludeOriginalFields && !req.IncludeBotAnalysis && !req.IncludeIndicators {
		req.IncludeOriginalFields = true
		req.IncludeBotAnalysis = true
		req.IncludeIndicators = true
	}
	
	// Логируем параметры запроса
	h.logger.Infof("CSV Export Request: Domain=%s, Limit=%d, StartDate=%v, EndDate=%v", 
		req.Domain, req.Limit, req.StartDate, req.EndDate)
	
	// ВАЖНО: Используем ту же логику запроса, что и в основной функции анализа
	// чтобы получить те же самые данные
	dbQuery := h.remoteDB.Model(&Click{})
	
	// Применяем лимит ПЕРВЫМ (как в getAllDataFromDBForBotAnalysis)
	if req.Limit > 0 {
		if req.Limit > 2000 {
			req.Limit = 2000 // Максимум 2000
		}
		dbQuery = dbQuery.Limit(req.Limit)
		h.logger.Infof("Applying limit: %d", req.Limit)
	} else {
		// Если лимит не указан, ставим разумное значение по умолчанию
		dbQuery = dbQuery.Limit(100)
		h.logger.Info("No limit specified, using default: 100")
	}
	
	// Offset если есть (как в getAllDataFromDBForBotAnalysis)
	if req.Offset > 0 {
		dbQuery = dbQuery.Offset(req.Offset)
	}
	
	// ВАЖНО: Используем ту же сортировку что и в анализе - по ID, а не по дате!
	dbQuery = dbQuery.Order("id DESC")
	
	// Фильтр по домену
	if req.Domain != "" {
		dbQuery = dbQuery.Where("domain = ?", req.Domain)
	}
	
	// Фильтр по датам (такой же как в getAllDataFromDBForBotAnalysis)
	if req.StartDate != nil && req.EndDate != nil {
		dbQuery = dbQuery.Where("created_at BETWEEN ? AND ?", req.StartDate, req.EndDate)
	} else if req.StartDate != nil {
		dbQuery = dbQuery.Where("created_at >= ?", req.StartDate)
	} else if req.EndDate != nil {
		dbQuery = dbQuery.Where("created_at <= ?", req.EndDate)
	}
	
	var clicks []Click
	if err := dbQuery.Find(&clicks).Error; err != nil {
		http.Error(w, fmt.Sprintf("Ошибка получения данных: %v", err), http.StatusInternalServerError)
		return
	}
	
	if len(clicks) == 0 {
		http.Error(w, "Нет данных для экспорта", http.StatusNotFound)
		return
	}
	
	// Анализируем каждый клик и собираем статистику
	var results []BotAnalysisResult
	statusCount := map[string]int{
		"BOT": 0,
		"PROBABLE_BOT": 0,
		"SUSPICIOUS": 0,
		"HUMAN": 0,
	}
	
	for _, click := range clicks {
		result := BotAnalysisResult{Click: click}
		analyzeBot(&result, []Click{click})
		
		// Подсчитываем статистику
		statusCount[result.BotStatus]++
		
		// Фильтруем по статусу
		shouldInclude := false
		switch result.BotStatus {
		case "BOT":
			shouldInclude = req.IncludeBots
		case "PROBABLE_BOT":
			shouldInclude = req.IncludeProbableBots
		case "SUSPICIOUS":
			shouldInclude = req.IncludeSuspicious
		case "HUMAN":
			shouldInclude = req.IncludeHumans
		default:
			h.logger.Warnf("Unknown bot status: %s", result.BotStatus)
			shouldInclude = true
		}
		
		if shouldInclude {
			results = append(results, result)
		}
	}
	
	// Логируем подробную статистику
	h.logger.Infof("Analysis statistics before filtering: BOT=%d, PROBABLE_BOT=%d, SUSPICIOUS=%d, HUMAN=%d",
		statusCount["BOT"], statusCount["PROBABLE_BOT"], statusCount["SUSPICIOUS"], statusCount["HUMAN"])
	h.logger.Infof("Filter settings: IncludeBots=%v, IncludeProbableBots=%v, IncludeSuspicious=%v, IncludeHumans=%v",
		req.IncludeBots, req.IncludeProbableBots, req.IncludeSuspicious, req.IncludeHumans)
	h.logger.Infof("Results after filtering: %d records", len(results))
	
	if len(results) == 0 {
		// Возвращаем более информативное сообщение
		detailedMsg := fmt.Sprintf("Нет данных после фильтрации. Статистика: BOT=%d, PROBABLE_BOT=%d, SUSPICIOUS=%d, HUMAN=%d. Фильтры: Боты=%v, Вероятные боты=%v, Подозрительные=%v, Люди=%v",
			statusCount["BOT"], statusCount["PROBABLE_BOT"], statusCount["SUSPICIOUS"], statusCount["HUMAN"],
			req.IncludeBots, req.IncludeProbableBots, req.IncludeSuspicious, req.IncludeHumans)
		
		http.Error(w, detailedMsg, http.StatusNotFound)
		return
	}
	
	// Логируем статистику
	h.logger.Infof("Export statistics: Total analyzed: %d, After filtering: %d", len(clicks), len(results))
	
	// Создаем имя файла с информацией о количестве записей
	filename := fmt.Sprintf("bot_analysis_%s_%d_records.csv", 
		time.Now().Format("2006-01-02_15-04-05"), len(results))
	
	// Создаем CSV
	w.Header().Set("Content-Type", "text/csv; charset=utf-8")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment;filename=%s", filename))
	
	// Создаем буфер с BOM для правильного отображения UTF-8 в Excel
	var buffer bytes.Buffer
	buffer.Write([]byte("\xEF\xBB\xBF"))
	
	writer := csv.NewWriter(&buffer)
	
	// Создаем заголовки
	var headers []string
	
	// Основные поля - ВСЕ поля из базы данных как в исходных CSV
	if req.IncludeOriginalFields {
		headers = append(headers, 
			"Domain", "Created At", "GCLID", "IP", 
			"Headers", "JS Data", "Time Spent", 
			"Click Coordinates", "Scroll Coordinates",
			"Click On Number", "Account ID", "Company ID", 
			"Keyword", "Device", "Browser Fingerprint", "Suspicious Traffic")
	}
	
	// Поля анализа ботов
	if req.IncludeBotAnalysis {
		headers = append(headers,
			"Bot Score", "Bot Status", "Bot Probability %",
			"Total Checks", "Triggered Checks")
	}
	
	// Индикаторы
	if req.IncludeIndicators {
		headers = append(headers,
			"Critical Indicators", "High Risk Indicators", 
			"Medium Risk Indicators", "Low Risk Indicators",
			"Main Bot Reasons", "Detailed Analysis Report", 
			"All Checked Parameters", "Triggered Parameters Details")
	}
	
	// Записываем заголовки
	if err := writer.Write(headers); err != nil {
		http.Error(w, "Ошибка записи заголовков", http.StatusInternalServerError)
		return
	}
	
	// Записываем данные
	for _, result := range results {
		var record []string
		
		// Основные поля - ВСЕ поля как в исходных CSV
		if req.IncludeOriginalFields {
			record = append(record,
				result.Domain,
				result.CreatedAt.Format("2006-01-02 15:04:05"),
				result.Gclid,
				result.IP,
				result.Headers,      // JSON с заголовками
				result.JsData,       // JSON с данными браузера
				result.TimeSpent,
				result.ClickCoordinates,
				result.ScrollCoordinates,
				fmt.Sprintf("%v", result.ClickOnNumber),
				result.AccountID,
				result.CompanyID,
				result.Keyword,
				result.Device,
				result.Fingerprint,
				fmt.Sprintf("%v", result.IsChecked), // Suspicious Traffic
			)
		}
		
		// Поля анализа
		if req.IncludeBotAnalysis {
			record = append(record,
				fmt.Sprintf("%d", result.BotScore),
				result.BotStatus,
				fmt.Sprintf("%.1f", result.BotProbability),
				fmt.Sprintf("%d", result.TotalChecks),
				fmt.Sprintf("%d", result.TriggeredChecks),
			)
		}
		
		// Индикаторы
		if req.IncludeIndicators {
			// Группируем индикаторы по категориям
			var critical, high, medium, low []string
			var mainReasons []string
			
			indicators := result.BotIndicators
			if !req.OnlyTriggeredIndicators {
				indicators = result.AllCheckedParams
			}
			
			for _, ind := range indicators {
				if req.OnlyTriggeredIndicators && !ind.Triggered {
					continue
				}
				
				indicatorText := fmt.Sprintf("%s (%d pts)", ind.Description, ind.Score)
				
				switch ind.Category {
				case "CRITICAL":
					critical = append(critical, indicatorText)
					if ind.Triggered && len(mainReasons) < 3 {
						mainReasons = append(mainReasons, ind.Description)
					}
				case "HIGH":
					high = append(high, indicatorText)
					if ind.Triggered && len(mainReasons) < 3 {
						mainReasons = append(mainReasons, ind.Description)
					}
				case "MEDIUM":
					medium = append(medium, indicatorText)
				case "LOW":
					low = append(low, indicatorText)
				}
			}
			
			// Создаем список всех проверенных параметров с их значениями
			var allCheckedList []string
			var triggeredDetailsList []string
			
			for _, param := range result.AllCheckedParams {
				checkInfo := fmt.Sprintf("[%s] %s: %s (Expected: %s) - Score: %d", 
					param.Category, param.Name, param.Value, param.Expected, param.Score)
				allCheckedList = append(allCheckedList, checkInfo)
				
				if param.Triggered {
					// Для сработавших добавляем детальное объяснение (без переносов строк для CSV)
					// Заменяем все переносы строк и специальные символы
					cleanedExplanation := strings.ReplaceAll(param.DetailedExplanation, "\n", " ")
					cleanedExplanation = strings.ReplaceAll(cleanedExplanation, "\r", " ")
					cleanedExplanation = strings.ReplaceAll(cleanedExplanation, "\t", " ")
					cleanedExplanation = strings.ReplaceAll(cleanedExplanation, "\"", "'")
					
					detailInfo := fmt.Sprintf("[%s] %s (%d pts) | Value: %s | Expected: %s | Reason: %s", 
						param.Category, param.Description, param.Score, param.Value, param.Expected, 
						cleanedExplanation)
					triggeredDetailsList = append(triggeredDetailsList, detailInfo)
				}
			}
			
			// Очищаем отчет анализа от переносов строк и специальных символов
			cleanedReport := strings.ReplaceAll(result.AnalysisReport, "\n", " | ")
			cleanedReport = strings.ReplaceAll(cleanedReport, "\r", " ")
			cleanedReport = strings.ReplaceAll(cleanedReport, "\t", " ")
			// Убираем знаки = в начале, чтобы Excel не считал это формулой
			cleanedReport = strings.ReplaceAll(cleanedReport, "===", "---")
			cleanedReport = strings.ReplaceAll(cleanedReport, "==", "--")
			// Если строка начинается с =, добавляем апостроф
			if strings.HasPrefix(cleanedReport, "=") {
				cleanedReport = "'" + cleanedReport
			}
			
			// Функция для защиты от интерпретации как формулы в Excel
			protectFromExcel := func(s string) string {
				// Если строка начинается с =, +, -, @, добавляем апостроф
				if len(s) > 0 && (s[0] == '=' || s[0] == '+' || s[0] == '-' || s[0] == '@') {
					return "'" + s
				}
				return s
			}
			
			// Добавляем в запись с защитой от Excel
			record = append(record,
				protectFromExcel(strings.Join(critical, "; ")),
				protectFromExcel(strings.Join(high, "; ")),
				protectFromExcel(strings.Join(medium, "; ")),
				protectFromExcel(strings.Join(low, "; ")),
				protectFromExcel(strings.Join(mainReasons, "; ")),
				protectFromExcel(cleanedReport),                                   // Полный отчет анализа
				protectFromExcel(strings.Join(allCheckedList, " | ")),            // Все проверенные параметры
				protectFromExcel(strings.Join(triggeredDetailsList, " || ")),     // Детали сработавших индикаторов
			)
		}
		
		// Записываем строку
		if err := writer.Write(record); err != nil {
			http.Error(w, "Ошибка записи данных", http.StatusInternalServerError)
			return
		}
	}
	
	// Завершаем запись
	writer.Flush()
	if err := writer.Error(); err != nil {
		http.Error(w, "Ошибка создания CSV", http.StatusInternalServerError)
		return
	}
	
	// Отправляем файл
	if _, err := w.Write(buffer.Bytes()); err != nil {
		http.Error(w, "Ошибка отправки файла", http.StatusInternalServerError)
		return
	}
}

func hasAbnormalHeaders(headers HeadersField) bool {
	// Проверяем наличие критичных заголовков
	if headers.Accept == "" || headers.UserAgent == "" {
		return true
	}

	// Проверяем Sec-Fetch headers (должны быть в современных браузерах)
	if headers.SecFetchSite == "" && headers.SecFetchMode == "" && headers.SecFetchDest == "" {
		return true
	}

	return false
}

func isOutdatedBrowser(ua string) bool {
	ua = strings.ToLower(ua)

	// Проверяем старые версии браузеров
	outdatedPatterns := []string{
		"msie", "trident", // Internet Explorer
		"chrome/[1-6][0-9]\\.",  // Chrome < 70
		"firefox/[1-5][0-9]\\.", // Firefox < 60
		"safari/[1-9]\\.",       // Safari < 10
	}

	for _, pattern := range outdatedPatterns {
		if strings.Contains(ua, pattern) {
			return true
		}
	}

	return false
}

func truncateString(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// Вычисление финального статуса бота
func calculateBotStatus(result *BotAnalysisResult) {
	score := result.BotScore

	// Определяем статус по баллам
	if score >= 100 {
		result.BotStatus = "BOT"
		result.BotProbability = min(99.9, 50+float64(score)/10)
	} else if score >= 50 {
		result.BotStatus = "PROBABLE_BOT"
		result.BotProbability = 30 + float64(score)/5
	} else if score >= 25 {
		result.BotStatus = "SUSPICIOUS"
		result.BotProbability = 15 + float64(score)/4
	} else {
		result.BotStatus = "HUMAN"
		result.BotProbability = float64(score) / 2
	}
}

// Генерация детального отчета для Google
func generateAnalysisReport(result *BotAnalysisResult) {
	var report strings.Builder

	report.WriteString(fmt.Sprintf("=== COMPREHENSIVE BOT ANALYSIS REPORT ===\n"))
	report.WriteString(fmt.Sprintf("Status: %s\n", result.BotStatus))
	report.WriteString(fmt.Sprintf("Score: %d points\n", result.BotScore))
	report.WriteString(fmt.Sprintf("Bot Probability: %.1f%%\n", result.BotProbability))
	report.WriteString(fmt.Sprintf("\n[ANALYSIS SUMMARY]\n"))
	report.WriteString(fmt.Sprintf("Total Parameters Checked: %d\n", result.TotalChecks))
	report.WriteString(fmt.Sprintf("Parameters Triggered: %d (%.1f%%)\n",
		result.TriggeredChecks,
		float64(result.TriggeredChecks)/float64(result.TotalChecks)*100))
	report.WriteString(fmt.Sprintf("Parameters Passed: %d (%.1f%%)\n\n",
		result.TotalChecks-result.TriggeredChecks,
		float64(result.TotalChecks-result.TriggeredChecks)/float64(result.TotalChecks)*100))

	// Показываем все проверенные параметры
	report.WriteString("[ALL CHECKED PARAMETERS]\n")

	// Группируем все параметры по категориям
	criticalAll := []BotIndicator{}
	highAll := []BotIndicator{}
	mediumAll := []BotIndicator{}
	lowAll := []BotIndicator{}

	for _, param := range result.AllCheckedParams {
		switch param.Category {
		case "CRITICAL":
			criticalAll = append(criticalAll, param)
		case "HIGH":
			highAll = append(highAll, param)
		case "MEDIUM":
			mediumAll = append(mediumAll, param)
		case "LOW":
			lowAll = append(lowAll, param)
		}
	}

	// Критические проверки
	if len(criticalAll) > 0 {
		report.WriteString("\n[CRITICAL CHECKS - Weight: 100 pts each]\n")
		for _, param := range criticalAll {
			status := "✓ PASSED"
			if param.Triggered {
				status = "✗ FAILED"
			}
			report.WriteString(fmt.Sprintf("%s %s: %s\n", status, param.Name, param.Description))
			report.WriteString(fmt.Sprintf("   Value: %s | Expected: %s\n", param.Value, param.Expected))
		}
	}

	// Высокие проверки
	if len(highAll) > 0 {
		report.WriteString("\n[HIGH RISK CHECKS - Weight: 50 pts each]\n")
		for _, param := range highAll {
			status := "✓ PASSED"
			if param.Triggered {
				status = "✗ FAILED"
			}
			report.WriteString(fmt.Sprintf("%s %s: %s\n", status, param.Name, param.Description))
			report.WriteString(fmt.Sprintf("   Value: %s | Expected: %s\n", param.Value, param.Expected))
		}
	}

	// Средние проверки
	if len(mediumAll) > 0 {
		report.WriteString("\n[MEDIUM RISK CHECKS - Weight: 25 pts each]\n")
		for _, param := range mediumAll {
			status := "✓ PASSED"
			if param.Triggered {
				status = "✗ FAILED"
			}
			report.WriteString(fmt.Sprintf("%s %s: %s\n", status, param.Name, param.Description))
			report.WriteString(fmt.Sprintf("   Value: %s | Expected: %s\n", param.Value, param.Expected))
		}
	}

	// Низкие проверки
	if len(lowAll) > 0 {
		report.WriteString("\n[LOW RISK CHECKS - Weight: 10 pts each]\n")
		for _, param := range lowAll {
			status := "✓ PASSED"
			if param.Triggered {
				status = "✗ FAILED"
			}
			report.WriteString(fmt.Sprintf("%s %s: %s\n", status, param.Name, param.Description))
			report.WriteString(fmt.Sprintf("   Value: %s | Expected: %s\n", param.Value, param.Expected))
		}
	}

	// Детали только сработавших индикаторов
	if len(result.BotIndicators) > 0 {
		report.WriteString("\n\n=== TRIGGERED BOT INDICATORS (Details) ===\n")

		// Группируем по категориям
		critical := []BotIndicator{}
		high := []BotIndicator{}
		medium := []BotIndicator{}
		low := []BotIndicator{}

		for _, ind := range result.BotIndicators {
			switch ind.Category {
			case "CRITICAL":
				critical = append(critical, ind)
			case "HIGH":
				high = append(high, ind)
			case "MEDIUM":
				medium = append(medium, ind)
			case "LOW":
				low = append(low, ind)
			}
		}

		if len(critical) > 0 {
			report.WriteString("\n[CRITICAL FAILURES]\n")
			for _, ind := range critical {
				report.WriteString(fmt.Sprintf("• %s (+%d pts)\n", ind.Description, ind.Score))
				report.WriteString(fmt.Sprintf("  Detected: %s\n", ind.Value))
				report.WriteString(fmt.Sprintf("  Expected for human: %s\n", ind.Expected))
			}
		}

		if len(high) > 0 {
			report.WriteString("\n[HIGH RISK FAILURES]\n")
			for _, ind := range high {
				report.WriteString(fmt.Sprintf("• %s (+%d pts)\n", ind.Description, ind.Score))
				report.WriteString(fmt.Sprintf("  Detected: %s\n", ind.Value))
				report.WriteString(fmt.Sprintf("  Expected for human: %s\n", ind.Expected))
			}
		}

		if len(medium) > 0 {
			report.WriteString("\n[MEDIUM RISK FAILURES]\n")
			for _, ind := range medium {
				report.WriteString(fmt.Sprintf("• %s (+%d pts)\n", ind.Description, ind.Score))
				report.WriteString(fmt.Sprintf("  Detected: %s\n", ind.Value))
			}
		}

		if len(low) > 0 {
			report.WriteString("\n[LOW RISK FAILURES]\n")
			for _, ind := range low {
				report.WriteString(fmt.Sprintf("• %s (+%d pts)\n", ind.Description, ind.Score))
				report.WriteString(fmt.Sprintf("  Detected: %s\n", ind.Value))
			}
		}
	}

	report.WriteString(fmt.Sprintf("\n\n[FINAL RECOMMENDATION]\n"))
	switch result.BotStatus {
	case "BOT":
		report.WriteString("ACTION: BLOCK IMMEDIATELY\n")
		report.WriteString("This traffic exhibits clear automated bot patterns and should be blocked.\n")
		report.WriteString("Multiple critical indicators suggest non-human behavior.")
	case "PROBABLE_BOT":
		report.WriteString("ACTION: CHALLENGE WITH CAPTCHA\n")
		report.WriteString("High probability of automated traffic. Implement additional verification.\n")
		report.WriteString("Consider rate limiting or temporary blocking if behavior persists.")
	case "SUSPICIOUS":
		report.WriteString("ACTION: MONITOR CLOSELY\n")
		report.WriteString("Some suspicious patterns detected. Continue monitoring for escalation.\n")
		report.WriteString("Consider implementing soft challenges if patterns persist.")
	case "HUMAN":
		report.WriteString("ACTION: ALLOW TRAFFIC\n")
		report.WriteString("Traffic appears to be legitimate human behavior.\n")
		report.WriteString("Continue standard monitoring practices.")
	}

	report.WriteString(fmt.Sprintf("\n[TECHNICAL DETAILS]\n"))
	report.WriteString(fmt.Sprintf("Analysis performed on %d behavioral parameters\n", result.TotalChecks))
	report.WriteString(fmt.Sprintf("Detection threshold: 100+ points = BOT, 50-99 = PROBABLE, 25-49 = SUSPICIOUS\n"))
	report.WriteString(fmt.Sprintf("This analysis includes Google Ads specific checks and window size validation.\n"))
	report.WriteString(fmt.Sprintf("Accept header validation for POST requests is enforced.\n"))
	report.WriteString(fmt.Sprintf("This analysis is suitable for Google Ads invalid traffic reporting.\n"))

	result.AnalysisReport = report.String()
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
