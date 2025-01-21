import CollapsibleTable from './CollapsibleTable/CollapsibleTable';

export default function Company({ rows, companyIDData, dataGoogleAccounts, setValue, setFilterCompanyID }) {
  return (
    <CollapsibleTable
      rows={rows}
      companyIDData={companyIDData}
      dataGoogleAccounts={dataGoogleAccounts}
      setValue={setValue}
      setFilterCompanyID={setFilterCompanyID}
    />
  );
}
