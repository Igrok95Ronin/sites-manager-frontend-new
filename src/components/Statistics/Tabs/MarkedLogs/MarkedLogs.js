import axios from 'axios';
import { useState, useEffect } from 'react';

import ReactVirtualizedTableCustom from '../../../ReactVirtualizedTableCustom/ReactVirtualizedTableCustom';
import Spinner from '../../../Spinner/Spinner';

import './MarkedLogs.scss';

const APIURL = process.env.REACT_APP_APIURL; // Получем url из конфига

const MarkedLogs = () => {
  const [dataLogs, setDataLogs] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalCountAll, setTotalCountAll] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await axios.get(
        // `http://localhost:8082/markedlogs?page=${page}&limit=${limit}`,
        `${APIURL}/markedlogs?page=${page}&limit=${limit}`,
      );
      const result = response.data;

      if (result && result.data) {
        setDataLogs((prevData) => [...prevData, ...result.data]);
        setTotalCount(result.count);
        setTotalCountAll(result.countAll);

        const newTotalDataLoaded = dataLogs.length + result.data.length;

        if (newTotalDataLoaded >= result.count) {
          setHasMore(false);
        } else {
          setPage((prevPage) => prevPage + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <p className="markedLogs__allRecords">Всего записей: {`${totalCount} / ${totalCountAll}`}</p>
      {loading && <Spinner loading={loading} />}
      <ReactVirtualizedTableCustom dataLogs={dataLogs} fetchData={fetchData} hasMore={hasMore} />
    </>
  );
};

export default MarkedLogs;
