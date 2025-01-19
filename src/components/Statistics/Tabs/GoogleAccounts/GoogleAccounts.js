import * as React from 'react';
import axiosInstance from '../../../../axiosInstance';

export default function GoogleAccounts({ setDataGoogleAccounts }) {
  React.useEffect(() => {
    const fetchCompanyID = async () => {
      try {
        const response = await axiosInstance.get('/viewgoogleaccount');
        setDataGoogleAccounts(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompanyID();
  }, [setDataGoogleAccounts]);
}
