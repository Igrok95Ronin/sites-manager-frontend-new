import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получаем URL из конфигурации

export async function UpdateCompanyNames(setLoading, setData, setError) {
  try {
    setLoading(true);
    const response = await axios.put(`${APIURL}/updatecomanynames`);
    console.log(response);
    setData(response.data);
  } catch (error) {
    console.error('Failed to update company names:', error);
    setError(error);
  } finally {
    setLoading(false);
  }
}
