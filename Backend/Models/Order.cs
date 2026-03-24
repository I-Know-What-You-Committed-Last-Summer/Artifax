namespace Artifax.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public DateTime OrderDateTime { get; set; }
        public bool OrderExpedite { get; set; }
        public string Status { get; set; } = "Pending";
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
        public Branch? Branch { get; set; }
    }
}