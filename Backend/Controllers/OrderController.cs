using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Artifax.Models;
using Artifax.Data;
using Artifax.DTOs;

namespace Artifax.Controllers
{
    /// <summary>
    /// Handles all order-related operations: CRUD and order management.
    /// </summary>
    [ApiController]
    [Route("api/[Controller]")]
    public class OrderController : ControllerBase
    {
        readonly ArtifaxContext context;

        public OrderController(ArtifaxContext incoming)
        {
            context = incoming;
        }

        #region GetRoutes

        // GET /api/Order — Returns all orders with their items and branch info
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await context.Orders
                .Include(o => o.OrderItems)      // Load the order items
                    .ThenInclude(oi => oi.Item)  // Load the item details for each order item
                .Include(o => o.Branch)          // Load the branch this order belongs to
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderReadDto
            {
                OrderID = o.OrderID,
                Status = o.Status,
                OrderDateTime = o.OrderDateTime,
                OrderItems = o.OrderItems.Select(oi => new OrderItemReadDto
                {
                    ItemName = oi.Item?.ItemName ?? "Unknown",
                    Quantity = oi.Quantity
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }

        // GET /api/Order/{id} — Returns a single order by ID with items and branch
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            var orderDto = new OrderReadDto
            {
                OrderID = order.OrderID,
                Status = order.Status,
                OrderDateTime = order.OrderDateTime,
                OrderItems = order.OrderItems.Select(oi => new OrderItemReadDto
                {
                    ItemName = oi.Item?.ItemName ?? "Unknown",
                    Quantity = oi.Quantity
                }).ToList()
            };

            return Ok(orderDto);
        }

        #endregion

        #region CreateRoutes

        // POST /api/Order/create — Creates a new order with items
        // Request body: { branchID, employeeID, orderExpedite, items: [{ itemID, quantity }] }
        [HttpPost("create")]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto newOrderDto)
        {
            // Validate that the branch exists in the database
            var branch = await context.Branches.FindAsync(newOrderDto.BranchID);
            if (branch == null)
                return BadRequest($"Branch with ID {newOrderDto.BranchID} does not exist.");

            // Validate that the employee exists in the database
            var employee = await context.Employees.FindAsync(newOrderDto.EmployeeID);
            if (employee == null)
                return BadRequest($"Employee with ID {newOrderDto.EmployeeID} does not exist.");

            // An order must have at least one item
            if (newOrderDto.Items == null || !newOrderDto.Items.Any())
                return BadRequest("Order must contain at least one item.");

            // Validate each item references an existing item and has a valid quantity
            foreach (var itemDto in newOrderDto.Items)
            {
                var item = await context.Items.FindAsync(itemDto.ItemID);
                if (item == null)
                    return BadRequest($"Item with ID {itemDto.ItemID} does not exist.");

                if (itemDto.Quantity <= 0)
                    return BadRequest("Each item must have a quantity greater than 0.");
            }

            // Create the order
            var newOrder = new Order
            {
                BranchID = newOrderDto.BranchID,
                EmployeeID = newOrderDto.EmployeeID,
                OrderExpedite = newOrderDto.OrderExpedite,
                Status = "Pending",
                OrderDateTime = DateTime.UtcNow,
                Branch = null // EF will resolve via FK
            };

            context.Orders.Add(newOrder);
            await context.SaveChangesAsync();

            // Add order items
            foreach (var itemDto in newOrderDto.Items)
            {
                var orderItem = new OrderItem
                {
                    OrderID = newOrder.OrderID,
                    ItemID = itemDto.ItemID,
                    Quantity = itemDto.Quantity
                };
                context.OrderItems.Add(orderItem);
            }

            await context.SaveChangesAsync();

            // Reload and return the created order
            var created = await context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.OrderID == newOrder.OrderID);

            var createdDto = new OrderReadDto
            {
                OrderID = created.OrderID,
                Status = created.Status,
                OrderDateTime = created.OrderDateTime,
                OrderItems = created.OrderItems.Select(oi => new OrderItemReadDto
                {
                    ItemName = oi.Item?.ItemName ?? "Unknown",
                    Quantity = oi.Quantity
                }).ToList()
            };

            return CreatedAtAction(nameof(GetOrderById), new { id = newOrder.OrderID }, createdDto);
        }

        #endregion

        #region UpdateRoutes

        // PUT /api/Order/{id} — Updates an existing order (cannot update if already completed)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderCreateDto updatedOrderDto)
        {
            var existingOrder = await context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (existingOrder == null)
                return NotFound($"Order with ID {id} not found.");

            // Prevent updates to completed orders
            if (existingOrder.Status == "Completed" || existingOrder.Status == "Crafted")
                return BadRequest("Cannot update a completed order.");

            // Validate the branch exists
            var branch = await context.Branches.FindAsync(updatedOrderDto.BranchID);
            if (branch == null)
                return BadRequest($"Branch with ID {updatedOrderDto.BranchID} does not exist.");

            // Validate all items exist
            if (updatedOrderDto.Items != null)
            {
                foreach (var itemDto in updatedOrderDto.Items)
                {
                    var item = await context.Items.FindAsync(itemDto.ItemID);
                    if (item == null)
                        return BadRequest($"Item with ID {itemDto.ItemID} does not exist.");
                }
            }

            // Update basic fields
            existingOrder.BranchID = updatedOrderDto.BranchID;
            existingOrder.EmployeeID = updatedOrderDto.EmployeeID;
            existingOrder.OrderExpedite = updatedOrderDto.OrderExpedite;

            // Remove old items and add new ones
            context.OrderItems.RemoveRange(existingOrder.OrderItems);
            if (updatedOrderDto.Items != null)
            {
                foreach (var itemDto in updatedOrderDto.Items)
                {
                    existingOrder.OrderItems.Add(new OrderItem
                    {
                        ItemID = itemDto.ItemID,
                        Quantity = itemDto.Quantity
                    });
                }
            }

            await context.SaveChangesAsync();

            // Reload with includes for response
            var result = await context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                .Include(o => o.Branch)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            var resultDto = new OrderReadDto
            {
                OrderID = result.OrderID,
                Status = result.Status,
                OrderDateTime = result.OrderDateTime,
                OrderItems = result.OrderItems.Select(oi => new OrderItemReadDto
                {
                    ItemName = oi.Item?.ItemName ?? "Unknown",
                    Quantity = oi.Quantity
                }).ToList()
            };

            return Ok(resultDto);
        }

        // PUT /api/Order/{id}/status — Update order status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto statusDto)
        {
            var order = await context.Orders.FindAsync(id);
            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            order.Status = statusDto.Status;
            await context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully." });
        }

        #endregion

        #region DeleteRoutes

        // DELETE /api/Order/{id} — Deletes an order
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderID == id);

            if (order == null)
                return NotFound($"Order with ID {id} not found.");

            // Prevent deletion of completed orders
            if (order.Status == "Completed" || order.Status == "Crafted")
                return BadRequest("Cannot delete a completed order.");

            // Remove order items first, then order
            context.OrderItems.RemoveRange(order.OrderItems);
            context.Orders.Remove(order);
            await context.SaveChangesAsync();

            return NoContent();
        }

        #endregion
    }
}