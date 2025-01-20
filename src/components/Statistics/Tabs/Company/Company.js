import CollapsibleTable from './CollapsibleTable/CollapsibleTable';

export default function Company({ rows, companyIDData }) {
  return <CollapsibleTable rows={rows} companyIDData={companyIDData} />;
}
