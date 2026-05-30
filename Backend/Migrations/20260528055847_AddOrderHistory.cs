using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OrderHistories",
                columns: table => new
                {
                    OrderHistoryID = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OrderID = table.Column<int>(type: "integer", nullable: false),
                    PreviousStatus = table.Column<string>(type: "text", nullable: false),
                    NewStatus = table.Column<string>(type: "text", nullable: false),
                    ChangedDateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ChangedByEmployeeID = table.Column<int>(type: "integer", nullable: true),
                    ChangeReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderHistories", x => x.OrderHistoryID);
                    table.ForeignKey(
                        name: "FK_OrderHistories_Employees_ChangedByEmployeeID",
                        column: x => x.ChangedByEmployeeID,
                        principalTable: "Employees",
                        principalColumn: "EmployeeId");
                    table.ForeignKey(
                        name: "FK_OrderHistories_Orders_OrderID",
                        column: x => x.OrderID,
                        principalTable: "Orders",
                        principalColumn: "OrderID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistories_ChangedByEmployeeID",
                table: "OrderHistories",
                column: "ChangedByEmployeeID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderHistories_OrderID",
                table: "OrderHistories",
                column: "OrderID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderHistories");
        }
    }
}
