import { useEffect } from 'react';
import axios from 'axios';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига
const RequestEditSubDomain = ({
  editSubDomain,
  visiblePhoneNumber,
  phoneNumber,
  setLoading,
  setData,
  setError,
  submitSubdomainEditRequest,
  setSubmitSubdomainEditRequest,
  setShowEditSubDomain,
}) => {
  useEffect(() => {
    if (submitSubdomainEditRequest) {
      const fetchData = async () => {
        // Устанавливаем состояние загрузки в true, чтобы отобразить индикатор загрузки
        setLoading(true);

        try {
          const response = await axios.patch(
            `${APIURL}/editsubdomain`,
            {
              subDomain: editSubDomain,
              visiblePhoneNumber: visiblePhoneNumber,
              phoneNumber: phoneNumber,
            },
            {},
          );
          setTimeout(() => {
            setShowEditSubDomain(false);
          }, 3000);
          setData(response.data);
        } catch (error) {
          setError(error);
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
    setSubmitSubdomainEditRequest(false);
  }, [
    submitSubdomainEditRequest,
    setSubmitSubdomainEditRequest,
    setLoading,
    setError,
    editSubDomain,
    visiblePhoneNumber,
    phoneNumber,
    setData,
    setShowEditSubDomain,
  ]);

  return;
};

export default RequestEditSubDomain;
