#nullable enable
using Artifax.Models;
namespace Artifax.Models 
{
    public class OrderItem
    {
        public int OrderItemID { get; set; }
        public int OrderID { get; set; }
        public int ItemID { get; set; } 
        public int Quantity { get; set; }

       public Order? Order { get; set; }
       public Item? Item { get; set; } // This line is currently causing your error
    }
}