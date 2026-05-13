namespace Artifax.DTOs
{
    public class OrderCreateDto
    {
        // we leave out OrderID and OrderDateTime because the server should handle those
        public int ProductID { get; set; }
        public bool OrderExpedite { get; set; }
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
    }
}