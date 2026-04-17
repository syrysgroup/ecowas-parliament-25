import CustomerListTable from "@/views/apps/ecommerce/customers/list/CustomerListTable";

const CustomerListPage = () => (
  <div className="container py-8">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Customers</h1>
      <p className="text-sm text-muted-foreground">Manage and track all your customers.</p>
    </div>
    <CustomerListTable />
  </div>
);

export default CustomerListPage;
