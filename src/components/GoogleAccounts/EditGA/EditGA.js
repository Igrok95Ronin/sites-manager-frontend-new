import { useEffect } from 'react';
import axiosInstance from '../../../axiosInstance'; // Используем централизованный экземпляр Axios

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const EditGA = ({
  setCallEditGoogleAccount,
  dataGA,
  onUpdateGoogleAccounts,
}) => {
  useEffect(() => {
    const fetchData = async () => {
      // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки

      try {
        // Выполняем POST-запрос с помощью axios
        // Первый аргумент - URL, на который отправляется запрос
        // Второй аргумент - данные, которые отправляются в теле запроса
        await axiosInstance.patch(
          // 'http://localhost:8082/editdomain',
          `${APIURL}/editgoogleaccount`,
          {
            account_id: dataGA.account_id,
            status: dataGA.status,
          },
          {
            headers: {
              'Content-Type': 'application/json', // Указываем заголовок, чтобы сервер знал, что данные передаются в формате JSON
            },
          },
        );
        // Если запрос успешен, сохраняем данные из ответа в состоянии 'data'
        //   setData(response.data);
        // console.log(response.data);
        onUpdateGoogleAccounts(); // Обновляем компонент если все прошло успешно
      } catch (error) {
        //   setError(error);
        console.log(error);
      } finally {
        // Независимо от результата запроса, устанавливаем состояние загрузки в false
        // Это нужно, чтобы скрыть индикатор загрузки
        // setLoading(false);
        setCallEditGoogleAccount(false);
      }
    };
    fetchData();
  }, [setCallEditGoogleAccount, dataGA, onUpdateGoogleAccounts]); // Зависимость позволяет избежать лишних вызовов

  return;
};

export default EditGA;
