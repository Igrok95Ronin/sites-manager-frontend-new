import CollapsibleTable from './CollapsibleTable/CollapsibleTable';

export default function Company({ rows, companyIDData, dataGoogleAccounts }) {
  return <CollapsibleTable rows={rows} companyIDData={companyIDData} dataGoogleAccounts={dataGoogleAccounts} />;
}
