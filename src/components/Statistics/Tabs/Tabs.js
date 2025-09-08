import TabPanelProps from '../Tabs/TabPanelProps/TabPanelProps';

import './Tabs.scss';

const Tabs = ({
  rows,
  VirtuosoTableComponents,
  companyIDData,
  dataGoogleAccounts,
  setFilterCompanyID,
  setFilterKeyword,
  setFilterByDomain,
  setFilterFingerprint,
  setFilterMotionDataRaw,
  setFilterAccountID,
  setFilterIP,
  setFilterTimeSpent,
  filterTimeSpent,
  setFilterScrollCoordinates,
  filterScrollCoordinates,
  setFilterClickCoordinates,
  filterClickCoordinates,
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
  visibleTabs,
  hasActiveFilters,
  resetAllFilters,
}) => {
  return (
    <section className="tabs">
      <div className="tabs__container">
        <div className="tabs__box">
          <TabPanelProps
            rows={rows}
            VirtuosoTableComponents={VirtuosoTableComponents}
            companyIDData={companyIDData}
            dataGoogleAccounts={dataGoogleAccounts}
            setFilterCompanyID={setFilterCompanyID}
            setFilterKeyword={setFilterKeyword}
            setFilterFingerprint={setFilterFingerprint}
            setFilterMotionDataRaw={setFilterMotionDataRaw}
            setFilterByDomain={setFilterByDomain}
            setFilterAccountID={setFilterAccountID}
            setFilterIP={setFilterIP}
            setFilterTimeSpent={setFilterTimeSpent}
            filterTimeSpent={filterTimeSpent}
            setFilterScrollCoordinates={setFilterScrollCoordinates}
            filterScrollCoordinates={filterScrollCoordinates}
            setFilterClickCoordinates={setFilterClickCoordinates}
            filterClickCoordinates={filterClickCoordinates}
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
            visibleTabs={visibleTabs}
            hasActiveFilters={hasActiveFilters}
            resetAllFilters={resetAllFilters}
          />
        </div>
      </div>
    </section>
  );
};

export default Tabs;
