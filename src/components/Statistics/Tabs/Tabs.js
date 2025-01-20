import TabPanelProps from '../Tabs/TabPanelProps/TabPanelProps';

import './Tabs.scss';

const Tabs = ({
  rows,
  VirtuosoTableComponents,
  companyIDData,
  fixedHeaderContent,
  rowContent,
  loadMoreRows,
  loading,
  hasMore,
  ColumnSelector,
  loadingRef,
  searchField,
  searchQuery,
  setSearchQuery,
  limit,
  setLimit,
  setSearchField,
  columns,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  return (
    <section className="tabs">
      <div className="tabs__container">
        <div className="tabs__box">
          <TabPanelProps
            rows={rows}
            VirtuosoTableComponents={VirtuosoTableComponents}
            companyIDData={companyIDData}
            fixedHeaderContent={fixedHeaderContent}
            rowContent={rowContent}
            loadMoreRows={loadMoreRows}
            loading={loading}
            hasMore={hasMore}
            ColumnSelector={ColumnSelector}
            loadingRef={loadingRef} // Передаем loadingRef
            searchField={searchField}
            setSearchField={setSearchField}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            limit={limit}
            setLimit={setLimit}
            columns={columns}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
        </div>
      </div>
    </section>
  );
};

export default Tabs;
