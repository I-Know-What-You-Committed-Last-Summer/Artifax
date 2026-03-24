namespace Artifax.Models
{
   
    /// Join table between Order and Product.
    /// Each OrderItem represents one line in an order: a product and how many to craft.
    
    public class OrderItem
    {
        public int OrderItemId { get; set; }   // Primary key
        public int OrderId { get; set; }       // Foreign key to Order
        public int ProductID { get; set; }     // Foreign key to Product
        public int Quantity { get; set; }      // How many of this product to craft
        public Order? Order { get; set; }      // Navigation property (nullable to avoid EF validation issues)
        public Product? Product { get; set; }  // Navigation property (nullable to avoid EF validation issues)
    }
}
