using System;
using System.Collections.Generic;

namespace Artifax.DTOs
{
    public class OrderCreateDto 
    {
        public int BranchID { get; set; }
        public int EmployeeID { get; set; }
        public bool OrderExpedite { get; set; }
        public List<OrderItemCreateDto> Items { get; set; } = new List<OrderItemCreateDto>();
    }

    public class OrderItemCreateDto 
    {
        public int ItemID { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderReadDto 
    {
        public int OrderID { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime OrderDateTime { get; set; }
        public List<OrderItemReadDto> OrderItems { get; set; } = new List<OrderItemReadDto>();
    }

    public class OrderItemReadDto 
    {
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}