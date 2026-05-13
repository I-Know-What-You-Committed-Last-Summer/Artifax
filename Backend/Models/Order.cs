using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Artifax.Models
{
    // Represents a customer order in the system
    public class Order
    {
        [Key]
        public int OrderID { get; set; }
        
        public DateTime OrderDateTime { get; set; }
        public bool OrderExpedite { get; set; }
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public string Status { get; set; } = "Pending";
        public decimal TotalAmount { get; set; }

        // Relationships
        public Branch? Branch { get; set; }
        
        // THIS is what allows an order to have many products!
        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();

    }
}