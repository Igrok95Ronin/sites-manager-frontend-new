import * as React from 'react';
import axios from 'axios';
const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

export default function CompanyNames({ setCompanyIDData }) {
  React.useEffect(() => {
    const fetchCompanyID = async () => {
      try {
        const response = await axios.get(`${APIURL}/companynames`);
        setCompanyIDData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompanyID();
  }, [setCompanyIDData]);
}
