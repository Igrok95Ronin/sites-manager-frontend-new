import TabPanelProps from '../Tabs/TabPanelProps/TabPanelProps';

import './Tabs.scss';

const Tabs = ({
  rows,
  VirtuosoTableComponents,
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
}) => {
  return (
    <section className="tabs">
      <div className="tabs__container">
        <div className="tabs__box">
          <TabPanelProps
            rows={rows}
            VirtuosoTableComponents={VirtuosoTableComponents}
            fixedHeaderContent={fixedHeaderContent}
            rowContent={rowContent}
            loadMoreRows={loadMoreRows}
            loading={loading}
            hasMore={hasMore}
            ColumnSelector={ColumnSelector}
            loadingRef={loadingRef} // Передаем loadingRef
            searchField={searchField}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      </div>
    </section>
  );
};

export default Tabs;
