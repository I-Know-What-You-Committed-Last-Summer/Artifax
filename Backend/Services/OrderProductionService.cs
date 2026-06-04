#nullable enable
using Microsoft.EntityFrameworkCore;
using Artifax.Data;
using Artifax.Models;

namespace Artifax.Services
{
    /// <summary>
    /// Background service that runs every minute to:
    /// 1. Increment TimeElapsed for active orders
    /// 2. Auto-complete orders when TimeElapsed >= TotalTime
    /// 3. Promote queued orders to active when < 3 active orders per branch
    /// </summary>
    public class OrderProductionService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderProductionService> _logger;

        public OrderProductionService(IServiceProvider serviceProvider, ILogger<OrderProductionService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Order Production Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOrdersAsync();
                    // Run every 60 seconds (1 minute)
                    await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing orders in OrderProductionService");
                }
            }

            _logger.LogInformation("Order Production Service stopped.");
        }

        private async Task ProcessOrdersAsync()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ArtifaxContext>();

                // 1. Increment TimeElapsed for all Active orders
                var activeOrders = await context.Orders
                    .Where(o => o.Status == "Active")
                    .ToListAsync();

                foreach (var order in activeOrders)
                {
                    order.TimeElapsed += 1; // Increment by 1 minute
                    _logger.LogInformation($"Order {order.OrderID}: TimeElapsed={order.TimeElapsed}/{order.TotalTime}");

                    // 2. Auto-complete if TimeElapsed >= TotalTime
                    if (order.TimeElapsed >= order.TotalTime)
                    {
                        order.Status = "Complete";
                        order.CompletedDateTime = DateTime.UtcNow;

                        // Log to OrderHistory
                        var history = new OrderHistory
                        {
                            OrderID = order.OrderID,
                            PreviousStatus = "Active",
                            NewStatus = "Complete",
                            ChangedDateTime = DateTime.UtcNow,
                            ChangeReason = "Auto-completed by production service"
                        };
                        context.OrderHistories.Add(history);
                        _logger.LogInformation($"Order {order.OrderID} auto-completed.");
                    }
                }

                await context.SaveChangesAsync();

                // 3. Check each branch and promote queued orders if < 3 active
                var branches = await context.Branches.ToListAsync();

                foreach (var branch in branches)
                {
                    int activeCount = await context.Orders
                        .Where(o => o.BranchID == branch.BranchID && o.Status == "Active")
                        .CountAsync();

                    if (activeCount < 3)
                    {
                        // Promote oldest queued order to active
                        var queuedOrder = await context.Orders
                            .Where(o => o.BranchID == branch.BranchID && o.Status == "Queued")
                            .OrderBy(o => o.CreatedDateTime)
                            .FirstOrDefaultAsync();

                        if (queuedOrder != null)
                        {
                            queuedOrder.Status = "Active";
                            queuedOrder.StartedDateTime = DateTime.UtcNow;

                            var history = new OrderHistory
                            {
                                OrderID = queuedOrder.OrderID,
                                PreviousStatus = "Queued",
                                NewStatus = "Active",
                                ChangedDateTime = DateTime.UtcNow,
                                ChangeReason = "Promoted from queue to active production"
                            };
                            context.OrderHistories.Add(history);
                            _logger.LogInformation($"Order {queuedOrder.OrderID} promoted to Active (Branch {branch.BranchID})");
                        }
                    }
                }

                await context.SaveChangesAsync();
            }
        }
    }
}
