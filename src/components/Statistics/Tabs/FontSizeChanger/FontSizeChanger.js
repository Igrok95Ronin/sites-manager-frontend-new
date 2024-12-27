import React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import RemoveIcon from "@mui/icons-material/Remove"; // Иконка минуса
import AddIcon from "@mui/icons-material/Add"; // Иконка плюса
import Tooltip from "@mui/material/Tooltip";
import useLocalStorageDataKeys from "../UseLocalStorage/UseLocalStorage"; // Подключаем ваш хук

const FontSizeChanger = () => {
  const [fontSize, setFontSize] = useLocalStorageDataKeys("fontSize", 15); // Используем локальный хук

  // Увеличить размер шрифта
  const increaseFontSize = () => {
    const newSize = fontSize < 20 ? fontSize + 1 : 20; // Лимит 20px
    setFontSize(newSize);
    document.documentElement.style.setProperty("--font-size", `${newSize}px`);
  };

  // Уменьшить размер шрифта
  const decreaseFontSize = () => {
    const newSize = fontSize > 10 ? fontSize - 1 : 10; // Лимит 10px
    setFontSize(newSize);
    document.documentElement.style.setProperty("--font-size", `${newSize}px`);
  };

  // Применяем сохраненное значение из localStorage при загрузке
  React.useEffect(() => {
    document.documentElement.style.setProperty("--font-size", `${fontSize}px`);
  }, [fontSize]);

  return (
    <div style={{ textAlign: "center", marginTop: "5px" }}>
      <Tooltip title="Размер шрифта" arrow>
        <Stack>
          <Button
            variant="text"
            sx={{ padding: 0, margin: 0 }}
            color="primary"
            onClick={decreaseFontSize}
          >
            <RemoveIcon /> {/* Иконка минуса */}
          </Button>
          {fontSize}px
          <Button
            variant="text"
            sx={{ padding: 0, margin: 0 }}
            color="secondary"
            onClick={increaseFontSize}
          >
            <AddIcon /> {/* Иконка плюса */}
          </Button>
        </Stack>
      </Tooltip>
    </div>
  );
};

export default FontSizeChanger;
