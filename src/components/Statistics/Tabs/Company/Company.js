import CollapsibleTable from './CollapsibleTable/CollapsibleTable';

export default function Company({
  rows,
  companyIDData,
  dataGoogleAccounts,
  setValue,
  setFilterCompanyID,
  setFilterKeyword,
  setFilterByDomain,
  setFilterAccountID,
}) {
  return (
    <CollapsibleTable
      rows={rows}
      companyIDData={companyIDData}
      dataGoogleAccounts={dataGoogleAccounts}
      setValue={setValue}
      setFilterCompanyID={setFilterCompanyID}
      setFilterKeyword={setFilterKeyword}
      setFilterByDomain={setFilterByDomain}
      setFilterAccountID={setFilterAccountID}
    />
  );
}
