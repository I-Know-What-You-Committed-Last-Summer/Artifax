#nullable enable
namespace Artifax.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public DateTime OrderDateTime { get; set; } = DateTime.UtcNow;
        public bool OrderExpedite { get; set; }
        public string Status { get; set; } = "Pending"; // Matches group's logic
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }

       public Branch? Branch { get; set; }
        // The bridge to the team's new Item model
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}