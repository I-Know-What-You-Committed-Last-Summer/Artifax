namespace Artifax.Models
{
  
    /// Represents a production order placed at a branch.
    /// An order contains a list of items (products + quantities) to be crafted.
    /// Status tracks whether the order is "Pending" or "Crafted".
   
    public class Order
    {
        public int Id { get; set; }                    // Primary key
        public int BranchID { get; set; }              // Which branch this order is for (foreign key)
        public int EmployeeID { get; set; }            // Which employee placed the order (foreign key)
        public DateTime OrderDateTime { get; set; }    // When the order was placed
        public bool OrderExpedite { get; set; }        // Whether the order is marked as urgent
        public string Status { get; set; } = "Pending"; // "Pending" or "Crafted" set to Crafted after craft endpoint is called
        public List<OrderItem> Items { get; set; } = new List<OrderItem>(); // The products and quantities in this order
        public Branch? Branch { get; set; }            // Navigation property — nullable so EF resolves it via BranchID FK
    }
}