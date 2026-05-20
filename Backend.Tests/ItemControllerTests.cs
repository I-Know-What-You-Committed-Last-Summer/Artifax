using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Artifax.Controllers;
using Artifax.Data;
using Artifax.Models;
using Artifax.DTOs;
using System;
using System.Threading.Tasks;

namespace Backend.Tests
{
    public class ItemControllerTests
    {
        // Helper method to build an isolated, clean in-memory database context for every test
        private DbContextOptions<ArtifaxContext> GetDbContextOptions()
        {
            return new DbContextOptionsBuilder<ArtifaxContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        [Fact]
        public async Task GetItem_WhenItemExists_ReturnsItemReadDto()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            
            var testItem = new Item { ItemID = 1, ItemName = "Stainless Square Steel", ItemCategory = "Metal", ProductionTime = 120 };
            context.Items.Add(testItem);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItem(1);

            //ASSERT
            var actionResult = Assert.IsType<ActionResult<ItemReadDto>>(result);
            var returnedDto = Assert.IsType<ItemReadDto>(actionResult.Value);
            Assert.Equal("Stainless Square Steel", returnedDto.ItemName);
            Assert.Equal("Metal", returnedDto.ItemCategory);
        }

        [Fact]
        public async Task GetItem_WhenItemDoesNotExist_ReturnsNotFound()
        {
            //Look for nothing
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var controller = new ItemController(context);

            //ACT
            var result = await controller.GetItem(999);

            //ASSERT
            Assert.IsType<NotFoundResult>(result.Result);
        }
        [Fact]
        public async Task GetManyItems_WhenItemsExist_ReturnsListOfItemReadDto()
        {
            //ARRANGE
            var options = GetDbContextOptions();
            using var context = new ArtifaxContext(options);
            var testItem1 = new Item { ItemID = 1, ItemName = "Stainless Square Steel", ItemCategory = "Metal", ProductionTime = 120 };
            var testItem2 = new Item { ItemID = 2, ItemName = "Wooden Plank", ItemCategory = "Wood", ProductionTime = 60 };
            context.Items.AddRange(testItem1, testItem2);
            await context.SaveChangesAsync();
            var controller = new ItemController(context);
            //ACT
            var result = await controller.GetAllItems();
            //ASSERT
            var actionResult = Assert.IsType<ActionResult<IEnumerable<ItemReadDto>>>(result);
            var returnedDtos = Assert.IsType<List<ItemReadDto>>(actionResult.Value);
            Assert.Equal(2, returnedDtos.Count);
        }
    }
}