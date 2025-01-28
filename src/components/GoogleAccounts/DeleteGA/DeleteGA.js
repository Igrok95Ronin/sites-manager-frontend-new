import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получаем URL из конфигурации

export async function DeleteGA(id, setDeleteGA) {
  try {
    setDeleteGA(true);
    const response = await axios.delete(`${APIURL}/softremovalga/${id}`);
    console.log(response);
  } catch (error) {
    console.log(error);
  } finally {
    setDeleteGA(false);
  }
}
